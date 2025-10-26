import express from "express";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { requireAdmin } from "../middlewares/auth";
import { getAllQuests, getQuestById, createQuest, updateQuest, deleteQuest, assignQuestPNJ } from "../controllers/quests";

const router = express.Router();

// GET all quests (admin)
router.get("/", requireAdmin, asyncHandler(getAllQuests));

// GET quest by id (admin)
router.get("/:id", requireAdmin, validateNumericParam("id"), asyncHandler(getQuestById));

// Required fields for quest creation / update
const questRequiredFields = ["name", "place", "clue", "lore", "time_limit", "xp"];

// Create quest (admin)
router.post("/", requireAdmin, validateBody(questRequiredFields), asyncHandler(createQuest));

// Update quest (admin)
router.patch("/:id", requireAdmin, validateNumericParam("id"), validateBody(questRequiredFields), asyncHandler(updateQuest));

// Delete quest (admin)
router.delete("/:id", requireAdmin, validateNumericParam("id"), asyncHandler(deleteQuest));

// Assign a PNJ user to a quest (admin)
router.post(
	"/:id/assign-pnj",
	requireAdmin,
	validateNumericParam("id"),
	validateBody(["pnj_id"]),
	asyncHandler(assignQuestPNJ)
);

export default router;
