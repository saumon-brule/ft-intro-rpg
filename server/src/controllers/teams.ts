import { Request, Response } from "express";
import { db, Team, TeamInvitation } from "../db/database";
import { AuthenticatedRequest } from "../middlewares/auth";

export const getAllTeams = async (req: Request, res: Response) => {
  const teams = await db.getAllTeams();
  res.json(teams);
};

export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  // Pick a random guild for the team
  const guilds = await db.getAllGuilds();
  if (!guilds || guilds.length === 0) return res.status(400).json({ error: "No guilds available to assign to the team" });
  const chosen = guilds[Math.floor(Math.random() * guilds.length)];

  // Create team with current user as leader
  // Prevent a user who already leads another team from creating a new one
  const existing = await db.getTeamByLeader(user.id);
  if (existing) return res.status(400).json({ error: "User already leads a team and cannot create another" });

  // Prevent a user who is already a member of a team from creating another
  const memberExisting = await db.getTeamByMember(user.id);
  if (memberExisting) return res.status(400).json({ error: "User already is member of a team and cannot create another" });

  const team = await db.createTeam({ name, leader_id: user.id, guild_id: chosen.id });
  // Add leader as owner member
  await db.addTeamMember(team.id, user.id, "owner");

  res.status(201).json(team);
};

export const getTeam = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid team id" });

  const team = await db.getTeamById(id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // augment with members and invitations
  const members = await db.getTeamMembers(id);
  const invites = await db.getPendingInvitations(id);

  res.json({ ...team, members, invitations: invites });
};

export const lockTeam = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid team id" });

  const team = await db.getTeamById(id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  if (team.leader_id !== user.id) return res.status(403).json({ error: "Only team leader can lock the team" });

  const count = await db.countTeamMembers(id);
  if (count < 3) return res.status(400).json({ error: "Team must have 3 members to be locked" });

  const updated = await db.updateTeam(id, { state_lock: true });
  res.json(updated);
};

export const deleteTeam = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid team id" });

  const team = await db.getTeamById(id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  if (team.leader_id !== user.id) return res.status(403).json({ error: "Only team leader can delete the team" });

  await db.deleteTeam(id);
  res.status(204).send();
};

export const inviteUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const teamId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(teamId) || isNaN(userId)) return res.status(400).json({ error: "Invalid id" });

  const team = await db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // Only leader can invite
  if (team.leader_id !== user.id) return res.status(403).json({ error: "Only team leader can invite users" });

  // Check if candidate user is already a member of any team
  const alreadyInAny = await db.getTeamByMember(userId);
  if (alreadyInAny) return res.status(400).json({ error: "User is already a member of another team" });

  // Check pending invites count (max 2 invites pending + members?) The spec: owner can invite up to 2 other users (invitation pending).
  const pendingInvites = await db.getPendingInvitations(teamId);
  // Count current members and compute available slots (max team size = 3)
  const currentMembersCount = await db.countTeamMembers(teamId);
  const maxTeamSize = 3;
  const availableSlots = maxTeamSize - currentMembersCount;
  if (availableSlots <= 0) return res.status(400).json({ error: "Team is already full" });
  if (pendingInvites.length >= availableSlots) return res.status(400).json({ error: "Not enough free slots for another pending invitation" });

  const existingInvite = await db.getInvitation(teamId, userId);
  if (existingInvite && existingInvite.status === 'pending') return res.status(400).json({ error: "An invitation is already pending for this user" });

  const invitation = await db.createInvitation(teamId, userId, user.id);
  res.status(201).json(invitation);
};

export const cancelInvite = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const teamId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(teamId) || isNaN(userId)) return res.status(400).json({ error: "Invalid id" });

  const team = await db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  if (team.leader_id !== user.id) return res.status(403).json({ error: "Only team leader can cancel invitations" });

  const cancelled = await db.cancelInvitation(teamId, userId);
  if (!cancelled) return res.status(404).json({ error: "No pending invitation found" });
  res.status(204).send();
};

export const acceptInvite = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const teamId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(teamId) || isNaN(userId)) return res.status(400).json({ error: "Invalid id" });

  // Only invited user can accept their invitation
  if (user.id !== userId) return res.status(403).json({ error: "You can only accept your own invitations" });

  const invite = await db.getPendingInvitation(teamId, userId);
  if (!invite) return res.status(404).json({ error: "No pending invitation found" });

  // Check team not locked
  const team = await db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (team.state_lock) return res.status(400).json({ error: "Team is locked" });

  // Ensure the user isn't already a member of any team
  const alreadyMemberElsewhere = await db.getTeamByMember(user.id);
  if (alreadyMemberElsewhere) return res.status(400).json({ error: "You are already a member of a team" });

  // Accept invitation
  const updated = await db.updateInvitationStatus(teamId, userId, 'accepted');
  if (!updated) return res.status(500).json({ error: "Failed to accept invitation" });

  // Add as member
  await db.addTeamMember(teamId, userId, "member");

  res.status(200).json({ message: "Invitation accepted" });
};

export const declineInvite = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const teamId = parseInt(req.params.id, 10);
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(teamId) || isNaN(userId)) return res.status(400).json({ error: "Invalid id" });

  if (user.id !== userId) return res.status(403).json({ error: "You can only decline your own invitations" });

  const invite = await db.getInvitation(teamId, userId);
  if (!invite || invite.status !== 'pending') return res.status(404).json({ error: "No pending invitation found" });

  const updated = await db.updateInvitationStatus(teamId, userId, 'declined');
  if (!updated) return res.status(500).json({ error: "Failed to decline invitation" });

  res.status(200).json({ message: "Invitation declined" });
};

export const leaveTeam = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Authentication required" });

  const teamId = parseInt(req.params.id, 10);
  if (isNaN(teamId)) return res.status(400).json({ error: "Invalid id" });

  const team = await db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // Can't leave if owner
  const isMember = await db.isUserInTeam(teamId, user.id);
  if (!isMember) return res.status(400).json({ error: "You are not a member of this team" });

  // If owner wants to leave, they must delete or transfer ownership; we will prevent leaving
  if (team.leader_id === user.id) return res.status(403).json({ error: "Team leader cannot leave the team" });

  // If team locked, members cannot leave
  if (team.state_lock) return res.status(400).json({ error: "Team is locked; members cannot leave" });

  const removed = await db.removeTeamMember(teamId, user.id);
  if (!removed) return res.status(500).json({ error: "Failed to leave team" });

  res.status(200).json({ message: "Left team" });
};
