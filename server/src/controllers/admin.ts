import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/database";

const JWT_SECRET = process.env.JWT_SECRET ?? "SECRET";

export const getTokenForUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid user id" });

  const user = await db.findUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
};
