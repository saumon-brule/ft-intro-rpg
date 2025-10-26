import express from "express";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { requireAdmin, requireAuth } from "../middlewares/auth";
import { assignQuestToTeam, finishActiveQuest, listTeamsOnQuest, getMyActiveQuests } from "../controllers/activeQuests";

const router = express.Router();

// Assign a quest to a team (admin)
router.post("/assign", requireAdmin, validateBody(["quest_id", "team_id"]), asyncHandler(assignQuestToTeam));

// Finish a quest (PNJ referent or admin)
router.post("/finish", requireAuth, validateBody(["quest_id", "team_id", "validated"]), asyncHandler(finishActiveQuest));

// List teams for a quest with status filter
router.get("/quest/:id", validateNumericParam("id"), asyncHandler(listTeamsOnQuest));

// Get active quests for authenticated user's team
router.get("/me", requireAuth, asyncHandler(getMyActiveQuests));

export default router;
