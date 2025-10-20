import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { getAllGuilds, getGuildById, addGuild, editGuild, deleteGuild } from "../controllers/guilds";

const router = express.Router();

// GET toutes les guilds
router.get("/", asyncHandler(getAllGuilds));

// GET une guild par id
router.get("/:id", validateNumericParam("id"), asyncHandler(getGuildById));

// ADD une guild (admin)
router.post(
	"/",
	requireAdmin,
	validateBody(["name", "image", "motto", "description", "primary_color", "place", "old_job"]),
	asyncHandler(addGuild)
);

// EDIT une guild (admin)
router.patch(
	"/:id",
	requireAdmin,
	validateNumericParam("id"),
	validateBody(["name", "image", "motto", "description", "primary_color", "place", "old_job"]),
	asyncHandler(editGuild)
);

// DELETE une guild (admin)
router.delete(
	"/:id",
	requireAdmin,
	validateNumericParam("id"),
	asyncHandler(deleteGuild)
);

export default router;
