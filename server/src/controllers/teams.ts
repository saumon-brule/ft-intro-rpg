import { Request, Response } from "express";
import { db, Team } from "../db/database";
import { AuthenticatedRequest } from "../middlewares/auth";

export const getAllTeams = async (req: Request, res: Response) => {
  const teams = await db.getAllTeams();
  res.json(teams);
};

export const getTeam = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid team id" });

  const team = await db.getTeamById(id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // augment with members
  const members = await db.getTeamMembers(id);

  res.json({ ...team, members });
};
