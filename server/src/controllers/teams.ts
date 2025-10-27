import { Request, Response } from "express";
import { db, Guild, Team, TeamMember } from "../db/database";

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

  // fetch full guild info instead of returning guild_id
  const guild = await db.getGuildById(team.guild_id);

  if (!guild) throw new Error("Pas de guild");

  const out: any = {
    id: team.id,
    guild: guild,
    xp: team.xp,
    created_at: team.created_at,
    updated_at: team.updated_at,
    members
  };

  res.json(out);
};
