import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { db } from "../db/database";

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
	// Try to find the team for the current user; if none, return null
	const user = req.user;
	if (!user) return res.status(401).json({ error: "Not authenticated" });

	try {
		const team = await db.getTeamByMember(user.id);
		const teamId = team ? team.id : null;
		res.json({ ...user, teamId });
	} catch (err) {
		console.error("Failed to fetch team for user:", err);
		res.status(500).json({ error: "Failed to fetch user team" });
	}
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
	const users = await db.getAllUsers();
	res.json(users);
};

export const updateUserPermission = async (req: AuthenticatedRequest, res: Response) => {
	const id42 = parseInt(req.params.id42);
	const { permission } = req.body;
	const updatedUser = await db.updateUser(id42, { permission });
	if (!updatedUser) {
		return res.status(404).json({ error: "User not found", id42 });
	}
	res.json({ message: "User permission updated successfully", user: updatedUser });
};
