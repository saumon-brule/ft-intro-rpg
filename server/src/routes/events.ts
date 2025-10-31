import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { Request, Response } from "express";
import { createTeamsEvent, broadcastMessage, broadcastToUser, startEvent, finishEvent } from "../controllers/events";

const router = express.Router();

// Create teams event (admin only)
router.post("/create-teams", requireAdmin, asyncHandler(createTeamsEvent));
// Start the event: assign a quest to every team and set event state to started
router.post("/start", requireAdmin, asyncHandler(startEvent));
// Finish the event: mark all active quests finished and notify players
router.post("/finish", requireAdmin, asyncHandler(finishEvent));

// Admin broadcast message to all connected sockets
router.post("/broadcast", requireAdmin, validateBody(["title", "subtitle", "content"]), asyncHandler(broadcastMessage));

// Send a notification to a specific user by id (admin)
router.post(
  "/broadcast/:id",
  requireAdmin,
  validateNumericParam("id"),
  validateBody(["title", "subtitle", "content"]),
  asyncHandler(broadcastToUser)
);

export default router;
