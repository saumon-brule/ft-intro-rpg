import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/validation";
import { createTeamsEvent } from "../controllers/events";

const router = express.Router();

// Create teams event (admin only)
router.post("/create-teams", requireAdmin, asyncHandler(createTeamsEvent));

export default router;
