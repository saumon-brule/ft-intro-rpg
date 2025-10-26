import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler, validateBody } from "../middlewares/validation";
import { Request, Response } from "express";
import { createTeamsEvent } from "../controllers/events";
import { broadcastAdminMessage } from "../socket";

const router = express.Router();

// Create teams event (admin only)
router.post("/create-teams", requireAdmin, asyncHandler(createTeamsEvent));

// Admin broadcast message to all connected sockets
router.post(
	"/broadcast",
	requireAdmin,
		validateBody(["message"]),
		asyncHandler(async (req: Request, res: Response) => {
			const { message } = req.body as any;
			broadcastAdminMessage(String(message));
			res.status(204).send();
		})
);

export default router;
