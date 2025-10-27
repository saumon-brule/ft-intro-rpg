import { Request, Response } from "express";
import { db, UserPermission } from "../db/database";
import { getUserSocketIds, getIo } from "../socket";
import { scheduleActiveQuest } from "../activeQuestScheduler";
import { assignNextQuestForTeam } from "../activeQuestProcessor";

// Assign a quest to a team (admin only)
export const assignQuestToTeam = async (req: Request, res: Response) => {
  const { quest_id, team_id } = req.body as any;

  const qId = Number(quest_id);
  const tId = Number(team_id);
  if (!qId || !tId || isNaN(qId) || isNaN(tId)) return res.status(400).json({ error: "Invalid quest_id or team_id" });

  const quest = await db.getQuestById(qId);
  if (!quest) return res.status(404).json({ error: "Quest not found" });

  const team = await db.getTeamById(tId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // A team can have only one in_progress active quest
  const teamActive = await db.getActiveQuestsByTeam(tId);
  if (teamActive.find((a) => a.status === "in_progress")) {
    return res.status(400).json({ error: "This team already has an active quest in progress" });
  }

  // ends_at = now + quest.time_limit (minutes)
  const endsAt = new Date(Date.now() + (quest.time_limit || 0) * 60 * 1000).toISOString();

  const active = await db.createActiveQuest({ quest_id: qId, team_id: tId, ends_at: endsAt });
  // schedule automatic expiration handling
  scheduleActiveQuest(active).catch(() => {});
  res.status(201).json(active);
};

// Finish a quest: can be called by PNJ referent or admin
export const finishActiveQuest = async (req: Request, res: Response) => {
  const { quest_id, team_id, validated } = req.body as any;
  const qId = Number(quest_id);
  const tId = Number(team_id);
  if (!qId || !tId || isNaN(qId) || isNaN(tId)) return res.status(400).json({ error: "Invalid quest_id or team_id" });

  // Need authenticated user info
  const authReq = req as any;
  const user = authReq.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const quest = await db.getQuestById(qId);
  if (!quest) return res.status(404).json({ error: "Quest not found" });

  // Only PNJ referent or admin can finish
  if (user.permission < UserPermission.ADMIN) {
    if (!quest.pnj_id || quest.pnj_id !== user.id) {
      return res.status(403).json({ error: "Only the quest PNJ referent or an admin can finish this quest" });
    }
  }

  // Find active quest entry
  const activeList = await db.getActiveQuestsByQuestId(qId);
  const active = activeList.find((a) => a.team_id === tId && a.status === "in_progress");
  if (!active) return res.status(404).json({ error: "Active quest for this quest/team not found" });

  // If time exceeded, force not validated
  const now = new Date();
  const ends = new Date(active.ends_at);
  let isValidated = Boolean(validated);
  if (now.getTime() > ends.getTime()) {
    isValidated = false;
  }

  const updated = await db.updateActiveQuest(active.id, { status: "finished", validated: isValidated });
  // After finishing, try to assign the next quest using shared helper
  const newAssigned = await assignNextQuestForTeam(tId);

  res.json({ finished: updated, new_active: newAssigned });
};

// List teams on a quest, with optional status filter (in_progress, finished, all)
export const listTeamsOnQuest = async (req: Request, res: Response) => {
  const qId = Number(req.params.id);
  if (!qId || isNaN(qId)) return res.status(400).json({ error: "Invalid quest id" });

  const status = (req.query.status as string) ?? "in_progress";
  if (!["in_progress", "finished", "all"].includes(status)) {
    return res.status(400).json({ error: "Invalid status filter" });
  }

  let activeList = await db.getActiveQuestsByQuestId(qId);
  if (status !== "all") {
    activeList = activeList.filter((a) => a.status === status);
  }

  const result = [] as any[];

  for (const a of activeList) {
    const team = await db.getTeamById(a.team_id);
    const members = await db.getTeamMembers(a.team_id);
    const users = await Promise.all(members.map((m) => db.findUserById(m.user_id)));

    result.push({
      active_quest: a,
      team: team,
      members: users.filter(Boolean)
    });
  }

  res.json(result);
};

// Get active quests for the authenticated user's team
export const getMyActiveQuests = async (req: Request, res: Response) => {
  const authReq = req as any;
  const user = authReq.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  // Find the team for this user
  const team = await db.getTeamByMember(user.id);
  if (!team) return res.json([]); // no team => no active quests

  // Get active quests for the team (only in_progress). There should be at most one; return only that one if present.
  let activeList = await db.getActiveQuestsByTeam(team.id);
  const active = activeList.find((a) => a.status === "in_progress");

  // No active quest in progress: compute whether the game is finished for this team
  const teamActiveAll = await db.getActiveQuestsByTeam(team.id);
  const doneQuestIds = new Set(teamActiveAll.map(a => a.quest_id));
  const allQuests = await db.getAllQuests();
  const candidates = allQuests.filter(q => !doneQuestIds.has(q.id));

  if (!active) {
    const members = await db.getTeamMembers(team.id);
    const users = await Promise.all(members.map((m) => db.findUserById(m.user_id)));
    if (candidates.length === 0) {
      return res.json({ active_quest: null, quest: null, team, members: users.filter(Boolean), status: "finished", remaining: 0 });
    }
    return res.json({ active_quest: null, quest: null, team, members: users.filter(Boolean), status: "waiting", remaining: candidates.length });
  }
  const quest = await db.getQuestById(active.quest_id);
  const members = await db.getTeamMembers(active.team_id);
  const users = await Promise.all(members.map((m) => db.findUserById(m.user_id)));

  const result = {
    active_quest: active,
    quest: quest,
    team: team,
    members: users.filter(Boolean)
  };

  res.json(result);
};

// Process expired active quests (to be called by a periodic scheduler).
// For each active quest whose ends_at <= now and status is in_progress,
// mark it finished with validated = false, then try to assign a new random quest
// to the same team (same logic as manual finish handler).
export const processExpiredActiveQuests = async () => {
  try {
    const now = new Date();
    const allActive = await db.getAllActiveQuests();
    const expired = allActive.filter(a => a.status === "in_progress" && new Date(a.ends_at) <= now);

    for (const active of expired) {
      try {
        // Close it and set validated = false
        await db.updateActiveQuest(active.id, { status: "finished", validated: false });
        const tId = active.team_id;
        await assignNextQuestForTeam(tId);
      } catch (err) {
        console.error("Error processing expired active quest", active.id, err);
      }
    }
  } catch (err) {
    console.error("Error in processExpiredActiveQuests", err);
  }
};
