import { Request, Response } from "express";
import { db } from "../db/database";

export const getAllGuilds = async (req: Request, res: Response) => {
	const guilds = await db.getAllGuilds();
	res.json(guilds);
};

export const getGuildById = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).json({ error: "Invalid guild id" });
	}
	const guild = await db.getGuildById(id);
	if (!guild) {
		return res.status(404).json({ error: "Guild not found", id });
	}
	res.json(guild);
};

export const addGuild = async (req: Request, res: Response) => {
	const guildData = req.body;
	const guild = await db.createGuild(guildData);
	res.status(201).json(guild);
};

export const editGuild = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).json({ error: "Invalid guild id" });
	}
	const updated = await db.updateGuild(id, req.body);
	if (!updated) {
		return res.status(404).json({ error: "Guild not found", id });
	}
	res.json(updated);
};

export const deleteGuild = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) {
		return res.status(400).json({ error: "Invalid guild id" });
	}
	const deleted = await db.deleteGuild(id);
	if (!deleted) {
		return res.status(404).json({ error: "Guild not found", id });
	}
	res.status(204).send();
};
