import { db } from "./db/database";
import { getUserSocketIds, getIo } from "./socket";
import { scheduleActiveQuest } from "./activeQuestScheduler";

// Helper: assign next available quest to a team (if any). Returns the created assignment or null.
export async function assignNextQuestForTeam(tId: number) {
	// Gather quest ids already taken by this team
	const teamActiveAll = await db.getActiveQuestsByTeam(tId);
	const doneQuestIds = new Set(teamActiveAll.map(a => a.quest_id));

	// Get all quests and filter those not done by the team
	const allQuests = await db.getAllQuests();
	const candidates = allQuests.filter(q => !doneQuestIds.has(q.id));

	if (candidates.length === 0) {
		// Notify team members that there are no more quests (game finished)
		const team = await db.getTeamById(tId);
		const members = await db.getTeamMembers(tId);
		const users = await Promise.all(members.map((m) => db.findUserById(m.user_id)));
		const socketIds = ([] as string[]).concat(...users.filter(Boolean).map(u => getUserSocketIds(u!.id)));
		const io = getIo();
		const payload = { active_quest: null, quest: null, newXp: team ? (team.xp || 0) : 0, gameStatus: "finished" };
		for (const sid of socketIds) {
			io.to(sid).emit("active_quest:assigned", payload);
		}
		return null;
	}

	// pick random quest
	const pick = candidates[Math.floor(Math.random() * candidates.length)];
	const endsAt = new Date(Date.now() + (pick.time_limit || 0) * 60 * 1000).toISOString();
	const newActive = await db.createActiveQuest({ quest_id: pick.id, team_id: tId, ends_at: endsAt });

	// schedule automatic expiration handling for newly created active quest
	scheduleActiveQuest(newActive).catch(err => console.error("Failed to schedule new active quest", err));

	const team = await db.getTeamById(tId);
	const members = await db.getTeamMembers(tId);
	const users = await Promise.all(members.map((m) => db.findUserById(m.user_id)));

	const newAssigned = {
		active_quest: newActive,
		quest: pick,
		newXp: team ? (team.xp || 0) : 0,
		gameStatus: "in_progress"
	};

	// Notify all team members over websocket
	const socketIds = ([] as string[]).concat(...users.filter(Boolean).map(u => getUserSocketIds(u!.id)));
	const io = getIo();
	for (const sid of socketIds) {
		io.to(sid).emit("active_quest:assigned", newAssigned);
	}

	return newAssigned;
}

// Process expired active quests in bulk
export async function processExpiredActiveQuests() {
	try {
		const now = new Date();
		const allActive = await db.getAllActiveQuests();
		const expired = allActive.filter(a => a.status === "in_progress" && new Date(a.ends_at) <= now);

		for (const active of expired) {
			await processSingleExpiredActiveQuest(active.id);
		}
	} catch (err) {
		console.error("Error in processExpiredActiveQuests", err);
	}
}

export async function processSingleExpiredActiveQuest(activeId: number) {
	try {
		const active = await db.getActiveQuestById(activeId);
		if (!active) return;
		if (active.status !== "in_progress") return;

		// Double-check ends_at
		const now = new Date();
		if (new Date(active.ends_at) > now) return; // not yet

		// Close it and set validated = false
		await db.updateActiveQuest(active.id, { status: "finished", validated: false });

		const tId = active.team_id;

		// Delegate to shared assigner
		return await assignNextQuestForTeam(tId);
	} catch (err) {
		console.error("Error processing single expired active quest", activeId, err);
	}
}

export default {
	processExpiredActiveQuests,
	processSingleExpiredActiveQuest,
	assignNextQuestForTeam
};
