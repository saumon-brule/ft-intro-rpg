import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { Request, Response } from "express";
import { createTeamsEvent, broadcastMessage, broadcastToUser } from "../controllers/events";

const router = express.Router();

// Create teams event (admin only)
router.post("/create-teams", requireAdmin, asyncHandler(createTeamsEvent));

// Admin broadcast message to all connected sockets
router.post("/broadcast", requireAdmin, validateBody(["message"]), asyncHandler(broadcastMessage));

// Send a notification to a specific user by id (admin)
router.post(
  "/broadcast/:id",
  requireAdmin,
  validateNumericParam("id"),
  validateBody(["message"]),
  asyncHandler(broadcastToUser)
);

export default router;
