import { db, ActiveQuest } from "./db/database";
import { processSingleExpiredActiveQuest } from "./activeQuestProcessor";

// In-memory map of activeQuestId -> timeout
const timeouts: Map<number, NodeJS.Timeout> = new Map();

// Schedule handler for a single active quest
export async function scheduleActiveQuest(a: ActiveQuest) {
  try {
    // Clear existing if present
    cancelActiveQuest(a.id);

    const ends = new Date(a.ends_at).getTime();
    const now = Date.now();
    const ms = Math.max(0, ends - now);

    if (ms === 0) {
      // expire immediately (run async)
      setImmediate(() => processSingleExpiredActiveQuest(a.id).catch(console.error));
      return;
    }

    const t = setTimeout(() => {
      processSingleExpiredActiveQuest(a.id).catch(err => console.error("Error in scheduled expiry", err));
      timeouts.delete(a.id);
    }, ms);

    timeouts.set(a.id, t);
  } catch (err) {
    console.error("Error scheduling active quest", a.id, err);
  }
}

export function cancelActiveQuest(activeId: number) {
  const t = timeouts.get(activeId);
  if (t) {
    clearTimeout(t);
    timeouts.delete(activeId);
  }
}

// Schedule all current in_progress active quests (call at startup)
export async function scheduleAllActiveQuests() {
  try {
    const all = await db.getAllActiveQuests();
    const inProgress = all.filter(a => a.status === "in_progress");
    for (const a of inProgress) {
      scheduleActiveQuest(a);
    }
  } catch (err) {
    console.error("Error scheduling all active quests", err);
  }
}

export default { scheduleActiveQuest, cancelActiveQuest, scheduleAllActiveQuests };
