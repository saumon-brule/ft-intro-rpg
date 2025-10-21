import express from "express";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import {
  getTeam,
  getAllTeams,
} from "../controllers/teams";

const router = express.Router();

// Création et gestion de team
router.use(requireAuth);
router.get("/", requireAdmin, asyncHandler(getAllTeams));
router.get("/:id", validateNumericParam("id"), asyncHandler(getTeam));


export default router;
