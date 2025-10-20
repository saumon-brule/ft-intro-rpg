import express from "express";
import { asyncHandler, validateBody, validateNumericParam } from "../middlewares/validation";
import { requireAuth } from "../middlewares/auth";
import {
  createTeam,
  getTeam,
  getAllTeams,
  lockTeam,
  deleteTeam,
  inviteUser,
  cancelInvite,
  acceptInvite,
  declineInvite,
  leaveTeam
} from "../controllers/teams";

const router = express.Router();

// Création et gestion de team
router.use(requireAuth);
router.get("/", asyncHandler(getAllTeams));
router.post("/", validateBody(["name", "guild_id"]), asyncHandler(createTeam));
router.get("/:id", validateNumericParam("id"), asyncHandler(getTeam));
router.patch("/:id/lock", validateNumericParam("id"), asyncHandler(lockTeam));
router.delete("/:id", validateNumericParam("id"), asyncHandler(deleteTeam));

// Invitations

router.post("/:id/invite/:userId", validateNumericParam("id"), validateNumericParam("userId"), asyncHandler(inviteUser));
router.delete("/:id/invite/:userId", validateNumericParam("id"), validateNumericParam("userId"), asyncHandler(cancelInvite));
router.post("/:id/invite/:userId/accept", validateNumericParam("id"), validateNumericParam("userId"), asyncHandler(acceptInvite));
router.post("/:id/invite/:userId/decline", validateNumericParam("id"), validateNumericParam("userId"), asyncHandler(declineInvite));

// Membre
router.post("/:id/leave", asyncHandler(leaveTeam));

export default router;
