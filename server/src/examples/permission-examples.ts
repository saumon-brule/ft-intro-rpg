// Exemples d'utilisation du système de permissions

import express, { Response } from "express";
import { 
	requireAuth, 
	requirePNJ, 
	requireAdmin, 
	publicRoute,
	verifyToken,
	AuthenticatedRequest 
} from "../middlewares/auth";
import { UserPermission } from "../db/database";

const router = express.Router();

// ============================================
// EXEMPLE 1 : Route Publique
// ============================================
router.get("/welcome", publicRoute, (req, res) => {
	res.json({ 
		message: "Bienvenue dans le RPG !",
		needsAuth: false
	});
});

// ============================================
// EXEMPLE 2 : Route Utilisateur Simple
// ============================================
router.get("/my-profile", requireAuth, (req: AuthenticatedRequest, res: Response) => {
	// req.user est disponible et vérifié
	res.json({
		message: "Voici votre profil",
		userId: req.user!.id,
		permission: req.user!.permission
	});
});

// ============================================
// EXEMPLE 3 : Route PNJ - Créer une Énigme
// ============================================
router.post("/enigmas", requirePNJ, (req: AuthenticatedRequest, res: Response) => {
	// Seuls les PNJ et admins peuvent créer des énigmes
	const { title, description, answer } = req.body;
	
	// Logique de création d'énigme...
	
	res.json({
		message: "Énigme créée avec succès",
		creator: req.user!.id
	});
});

// ============================================
// EXEMPLE 4 : Route Admin - Gestion Utilisateurs
// ============================================
router.delete("/users/:id", requireAdmin, (req: AuthenticatedRequest, res: Response) => {
	// Seuls les admins peuvent supprimer des utilisateurs
	const targetId = parseInt(req.params.id);
	
	// Logique de suppression...
	
	res.json({
		message: "Utilisateur supprimé",
		deletedBy: req.user!.id
	});
});

// ============================================
// EXEMPLE 5 : Vérification Conditionnelle
// ============================================
router.post("/teams/:id/join", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
	const team = { locked: true }; // Exemple : récupérer depuis DB
	
	// Seuls les PNJ/Admin peuvent rejoindre une équipe verrouillée
	if (team.locked && req.user!.permission < UserPermission.PNJ) {
		return res.status(403).json({
			error: "Cette équipe est verrouillée. Seuls les PNJ peuvent y accéder."
		});
	}
	
	// Logique pour rejoindre l'équipe...
	res.json({ message: "Équipe rejointe" });
});

// ============================================
// EXEMPLE 6 : Route avec Permissions Multiples
// ============================================
router.get("/stats", verifyToken, (req: AuthenticatedRequest, res: Response) => {
	// Différentes données selon le niveau de permission
	const baseStats = {
		totalUsers: 42,
		totalTeams: 10
	};
	
	if (req.user!.permission >= UserPermission.PNJ) {
		// Les PNJ voient plus de détails
		return res.json({
			...baseStats,
			activeEnigmas: 5,
			completionRate: "75%"
		});
	}
	
	if (req.user!.permission >= UserPermission.ADMIN) {
		// Les admins voient tout
		return res.json({
			...baseStats,
			activeEnigmas: 5,
			completionRate: "75%",
			databaseSize: "2.5 MB",
			serverLoad: "12%"
		});
	}
	
	// Utilisateurs normaux voient les stats basiques
	res.json(baseStats);
});

// ============================================
// EXEMPLE 7 : Middleware Personnalisé
// ============================================
const requireTeamLeader = async (req: AuthenticatedRequest, res: Response, next: express.NextFunction) => {
	const teamId = parseInt(req.params.teamId);
	
	// Exemple : vérifier que l'utilisateur est le leader de l'équipe
	// const team = await db.getTeamById(teamId);
	// if (team.leader_id !== req.user!.id && req.user!.permission < UserPermission.ADMIN) {
	// 	return res.status(403).json({ error: "Vous devez être le leader de cette équipe" });
	// }
	
	next();
};

router.patch("/teams/:teamId/settings", requireAuth, requireTeamLeader, (req: AuthenticatedRequest, res: Response) => {
	res.json({ message: "Paramètres de l'équipe mis à jour" });
});

// ============================================
// EXEMPLE 8 : Route avec Try-Catch
// ============================================
router.get("/secure-data", requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
	try {
		// Opération sensible...
		const sensitiveData = { secret: "data" };
		
		res.json({
			message: "Données sécurisées",
			data: sensitiveData,
			accessedBy: req.user!.id
		});
	} catch (error) {
		console.error("Error in secure-data route:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
