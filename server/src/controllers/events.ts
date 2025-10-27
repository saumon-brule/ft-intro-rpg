import { Request, Response } from "express";
import { db, UserPermission } from "../db/database";
import { broadcastAdminMessage, getUserSocketIds, getIo } from "../socket";
import { assignNextQuestForTeam } from "../activeQuestProcessor";
import { setEventState } from "../eventState";
import { cancelActiveQuest } from "../activeQuestScheduler";

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

/**
 * Create teams of 3 people based on pool_year and pool_month.
 * Rules:
 * - Only users with permission = USER (0) and pool_year = "2025" are eligible.
 * - pool_month values: "july", "august", "september".
 * - Prefer teams made of one user from each month (sep + aug + july).
 * - For leftovers, create teams of 3 from remaining users; if 1 or 2 remain, distribute them into random existing teams to create 4-member teams rather than tiny leftovers.
 */
export const createTeamsEvent = async (req: Request, res: Response) => {
  // Load users and guilds
  const users = await db.getAllUsers();
  const guilds = await db.getAllGuilds();

  if (!guilds || guilds.length === 0) {
    return res.status(400).json({ error: "No guilds available to assign teams" });
  }

  // Filter eligible users: permission USER and pool_year === '2025'
  const eligible = [] as typeof users;
  for (const u of users) {
    if (u.permission === UserPermission.USER && u.pool_year === "2024") {
      // skip if already member of a team
      // getTeamByMember returns Team | null
      // we don't await here yet; we'll filter below to keep sequential checks
      eligible.push(u);
    }
  }

  // Filter out those already in a team (shouldn't be any)
  const available: typeof eligible = [];
  for (const u of eligible) {
    // eslint-disable-next-line no-await-in-loop
    const team = await db.getTeamByMember(u.id);
    if (!team) available.push(u);
  }

  // Group by pool_month
  const groups: Record<string, typeof available> = {
    july: [],
    august: [],
    september: [],
  };

  for (const u of available) {
    const month = (u.pool_month || "").toLowerCase();
    if (month === "july" || month === "august" || month === "september") {
      groups[month].push(u);
    }
  }

  const createdTeams: Array<{ teamId: number; members: number[]; guild_id: number }> = [];

  // Step 1: create as many mixed teams (sep + aug + july) as possible
  const fullCount = Math.min(groups.july.length, groups.august.length, groups.september.length);
  for (let i = 0; i < fullCount; i++) {
    const a = groups.september.shift()!;
    const b = groups.august.shift()!;
    const c = groups.july.shift()!;
    // choose a random guild
    const chosen = guilds[Math.floor(Math.random() * guilds.length)];
    // create team
    // eslint-disable-next-line no-await-in-loop
    const team = await db.createTeam({ guild_id: chosen.id });
    // eslint-disable-next-line no-await-in-loop
    await db.addTeamMember(team.id, a.id);
    // eslint-disable-next-line no-await-in-loop
    await db.addTeamMember(team.id, b.id);
    // eslint-disable-next-line no-await-in-loop
    await db.addTeamMember(team.id, c.id);
    createdTeams.push({ teamId: team.id, members: [a.id, b.id, c.id], guild_id: chosen.id });
  }

  // Collect remaining users
  const remaining: typeof available = [];
  remaining.push(...groups.september, ...groups.august, ...groups.july);
  shuffle(remaining);

  // Helper to chunk array
  const chunk = <T,>(arr: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // Create teams of 3 from remaining
  const chunks = chunk(remaining, 3);
  const leftovers = chunks.filter(c => c.length < 3).flat();
  const fullChunks = chunks.filter(c => c.length === 3);

  for (const trio of fullChunks) {
    const chosen = guilds[Math.floor(Math.random() * guilds.length)];
    // eslint-disable-next-line no-await-in-loop
    const team = await db.createTeam({ guild_id: chosen.id });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(trio.map(u => db.addTeamMember(team.id, u.id)));
    createdTeams.push({ teamId: team.id, members: trio.map(u => u.id), guild_id: chosen.id });
  }

  // If leftovers exist (1 or 2), distribute into random existing teams (prefer fewer teams of 4)
  if (leftovers.length > 0) {
    if (createdTeams.length === 0) {
      // No existing teams: create one team and add all leftovers (will be size 1 or 2)
      const chosen = guilds[Math.floor(Math.random() * guilds.length)];
      // eslint-disable-next-line no-await-in-loop
      const team = await db.createTeam({ guild_id: chosen.id });
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(leftovers.map(u => db.addTeamMember(team.id, u.id)));
      createdTeams.push({ teamId: team.id, members: leftovers.map(u => u.id), guild_id: chosen.id });
    } else {
      // distribute each leftover into a random existing team
      for (const u of leftovers) {
        const pick = createdTeams[Math.floor(Math.random() * createdTeams.length)];
        // eslint-disable-next-line no-await-in-loop
        await db.addTeamMember(pick.teamId, u.id);
        pick.members.push(u.id);
      }
    }
  }

  return res.json({ created: createdTeams.length, teams: createdTeams });
};

// Start the event: set state to 'started' and assign a quest to every team (if none in progress)
export const startEvent = async (req: Request, res: Response) => {
  // set global state
  setEventState("started");

  const teams = await db.getAllTeams();
  const summary: Array<{ teamId: number; assigned: boolean; note?: string }> = [];

  for (const t of teams) {
    // skip if team already has in_progress quest
    const actives = await db.getActiveQuestsByTeam(t.id);
    if (actives.find(a => a.status === "in_progress")) {
      summary.push({ teamId: t.id, assigned: false, note: "already has active quest" });
      continue;
    }

    try {
      const assigned = await assignNextQuestForTeam(t.id);
      summary.push({ teamId: t.id, assigned: !!assigned, note: assigned ? undefined : "no candidate" });
    } catch (err) {
      summary.push({ teamId: t.id, assigned: false, note: String(err) });
    }
  }

  res.json({ started: true, summary });
};

// Finish the event: mark global state finished, close all in_progress active quests
// (set status=finished, validated=false), cancel scheduled timeouts and notify all players
export const finishEvent = async (req: Request, res: Response) => {
  setEventState("finished");

  try {
    const allActive = await db.getAllActiveQuests();
    const inProgress = allActive.filter(a => a.status === "in_progress");

    for (const a of inProgress) {
      try {
        await db.updateActiveQuest(a.id, { status: "finished", validated: false });
        // cancel any scheduled timeout
        try {
          cancelActiveQuest(a.id);
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error("Failed to finish active quest", a.id, err);
      }
    }

    // Notify all connected sockets that event is finished
    const io = getIo();
    io.emit("active_quest:status", { status: "finished", message: "Event finished" });

    return res.json({ finished: true, closed: inProgress.length });
  } catch (err) {
    console.error("Error finishing event", err);
    return res.status(500).json({ error: "Failed to finish event" });
  }
};

// Broadcast a message to all connected sockets (admin)
export const broadcastMessage = async (req: Request, res: Response) => {
  const { message } = req.body as any;
  if (typeof message !== "string") return res.status(400).json({ error: "message must be a string" });
  broadcastAdminMessage(String(message));
  res.status(204).send();
};

// Broadcast a message to a specific user (admin)
export const broadcastToUser = async (req: Request, res: Response) => {
  const id = (req.params as any).idParsed ?? Number(req.params.id);
  if (!id || isNaN(Number(id))) return res.status(400).json({ error: "Invalid user id" });
  const { message } = req.body as any;
  if (typeof message !== "string") return res.status(400).json({ error: "message must be a string" });

  const socketIds = getUserSocketIds(Number(id));
  if (!socketIds || socketIds.length === 0) {
    return res.status(404).json({ error: "User not connected" });
  }

  const io = getIo();
  for (const sid of socketIds) {
    io.to(sid).emit("admin:message", { message: String(message), ts: new Date().toISOString() });
  }

  res.status(204).send();
};
