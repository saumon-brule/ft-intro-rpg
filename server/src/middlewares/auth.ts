import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, UserPermission } from "../db/database";

const JWT_SECRET = process.env.JWT_TOKEN ?? "SECRET";

export interface UserJwtPayload {
	id: number;
}

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		permission: UserPermission;
	};
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const verifyToken = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.cookies.token;


		if (!token) {
			return res.status(401).json({ error: "No token provided" });
		}

		const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;

		if (!decoded || typeof decoded.id !== "number") {
			return res.status(401).json({ error: "Invalid token" });
		}

		// Fetch user from database to get permission
		const user = await db.findUserById(decoded.id);

		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		// Attach user info to request
		req.user = {
			...user
		};

		next();
	} catch (error) {
		console.error("Token verification error:", error);
		return res.status(401).json({ error: "Invalid or expired token" });
	}
};

/**
 * Middleware factory to check if user has required permission level
 * @param requiredPermission - Required permission level (null = public, 0 = user, 1 = pnj, 2 = admin)
 */
export const requirePermission = (requiredPermission: UserPermission | null) => {
	return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		// If route is public (null), allow access without authentication
		if (requiredPermission === null) {
			return next();
		}

		// If route requires authentication, verify token first
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Check if user has required permission level
		if (req.user.permission < requiredPermission) {
			return res.status(403).json({ 
				error: "Insufficient permissions",
				required: requiredPermission,
				current: req.user.permission
			});
		}

		next();
	};
};

/**
 * Helper middleware: Requires authentication (any logged-in user)
 */
export const requireAuth = [verifyToken, requirePermission(UserPermission.USER)];

/**
 * Helper middleware: Requires PNJ permission or higher
 */
export const requirePNJ = [verifyToken, requirePermission(UserPermission.PNJ)];

/**
 * Helper middleware: Requires Admin permission
 */
export const requireAdmin = [verifyToken, requirePermission(UserPermission.ADMIN)];

/**
 * Helper middleware: Public route (no authentication required)
 */
export const publicRoute = requirePermission(null);
