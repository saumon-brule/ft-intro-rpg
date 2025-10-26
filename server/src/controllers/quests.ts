import { Request, Response } from "express";
import { db, UserPermission } from "../db/database";

export const getAllQuests = async (req: Request, res: Response) => {
  const quests = await db.getAllQuests();
  res.json(quests);
};

export const getQuestById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid quest id" });
  const quest = await db.getQuestById(id);
  if (!quest) return res.status(404).json({ error: "Quest not found" });
  res.json(quest);
};

export const createQuest = async (req: Request, res: Response) => {
  const { name, place, clue, lore, time_limit, xp, pnj_id } = req.body;
  if (!name || !place || !clue || !lore || time_limit === undefined || xp === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // If pnj_id provided, check user exists and has permission PNJ or ADMIN
  if (pnj_id !== undefined && pnj_id !== null) {
    const user = await db.findUserById(Number(pnj_id));
    if (!user) return res.status(400).json({ error: "pnj_id user not found" });
    if (user.permission < UserPermission.PNJ) return res.status(400).json({ error: "pnj_id must refer to a PNJ or admin user" });
  }

  const quest = await db.createQuest({ name, place, clue, lore, time_limit: Number(time_limit), xp: Number(xp), pnj_id: pnj_id ?? null });
  res.status(201).json(quest);
};

export const updateQuest = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid quest id" });

  const body = req.body as any;
  if (body.pnj_id !== undefined && body.pnj_id !== null) {
    const user = await db.findUserById(Number(body.pnj_id));
    if (!user) return res.status(400).json({ error: "pnj_id user not found" });
    if (user.permission < UserPermission.PNJ) return res.status(400).json({ error: "pnj_id must refer to a PNJ or admin user" });
  }

  const updated = await db.updateQuest(id, body);
  if (!updated) return res.status(404).json({ error: "Quest not found" });
  res.json(updated);
};

export const deleteQuest = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid quest id" });
  const ok = await db.deleteQuest(id);
  if (!ok) return res.status(404).json({ error: "Quest not found" });
  res.status(204).send();
};

export const assignQuestPNJ = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid quest id" });

  const { pnj_id } = req.body as any;
  if (pnj_id === undefined || pnj_id === null) {
    return res.status(400).json({ error: "pnj_id is required" });
  }

  const pnjIdNum = Number(pnj_id);
  if (isNaN(pnjIdNum) || pnjIdNum <= 0) {
    return res.status(400).json({ error: "pnj_id must be a positive number" });
  }

  const user = await db.findUserById(pnjIdNum);
  if (!user) return res.status(400).json({ error: "pnj_id user not found" });
  if (user.permission < UserPermission.PNJ) return res.status(400).json({ error: "pnj_id must refer to a PNJ or admin user" });

  // Ensure this PNJ isn't already assigned to another quest
  const allQuests = await db.getAllQuests();
  const conflicting = allQuests.find((q) => q.pnj_id === pnjIdNum && q.id !== id);
  if (conflicting) {
    return res.status(400).json({ error: "This PNJ is already assigned to another quest", quest_id: conflicting.id });
  }

  const updated = await db.updateQuest(id, { pnj_id: pnjIdNum });
  if (!updated) return res.status(404).json({ error: "Quest not found" });
  res.json(updated);
};
