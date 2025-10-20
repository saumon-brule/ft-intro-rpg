import { Request, Response, NextFunction } from "express";
import { UserPermission } from "../db/database";

/**
 * Validation error response
 */
export class ValidationError extends Error {
	public statusCode: number;
	public details?: any;

	constructor(message: string, details?: any) {
		super(message);
		this.name = "ValidationError";
		this.statusCode = 400;
		this.details = details;
	}
}

/**
 * Validate request body has required fields
 */
export const validateBody = (requiredFields: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const missing: string[] = [];
		
		if (!req.body) {
			return res.status(400).json({
				error: "Request body is required",
				requiredFields
			});
		}

		for (const field of requiredFields) {
			if (req.body[field] === undefined || req.body[field] === null) {
				missing.push(field);
			}
		}

		if (missing.length > 0) {
			return res.status(400).json({
				error: "Missing required fields",
				missing,
				requiredFields
			});
		}

		next();
	};
};

/**
 * Validate permission value
 */
export const validatePermission = (req: Request, res: Response, next: NextFunction) => {
	const { permission } = req.body;

	if (permission === undefined || permission === null) {
		return res.status(400).json({
			error: "Permission field is required",
			validPermissions: {
				USER: UserPermission.USER,
				PNJ: UserPermission.PNJ,
				ADMIN: UserPermission.ADMIN
			}
		});
	}

	if (typeof permission !== "number") {
		return res.status(400).json({
			error: "Permission must be a number",
			received: typeof permission,
			validPermissions: {
				USER: UserPermission.USER,
				PNJ: UserPermission.PNJ,
				ADMIN: UserPermission.ADMIN
			}
		});
	}

	if (![UserPermission.USER, UserPermission.PNJ, UserPermission.ADMIN].includes(permission)) {
		return res.status(400).json({
			error: "Invalid permission level",
			received: permission,
			validPermissions: {
				USER: UserPermission.USER,
				PNJ: UserPermission.PNJ,
				ADMIN: UserPermission.ADMIN
			}
		});
	}

	next();
};

/**
 * Validate ID parameter (numeric)
 */
export const validateNumericParam = (paramName: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const value = req.params[paramName];

		if (!value) {
			return res.status(400).json({
				error: `Parameter '${paramName}' is required`
			});
		}

		const numValue = parseInt(value, 10);

		if (isNaN(numValue)) {
			return res.status(400).json({
				error: `Parameter '${paramName}' must be a valid number`,
				received: value
			});
		}

		if (numValue < 0) {
			return res.status(400).json({
				error: `Parameter '${paramName}' must be positive`,
				received: numValue
			});
		}

		// Store the parsed value in req.params for later use
		(req.params as any)[`${paramName}Parsed`] = numValue;

		next();
	};
};

/**
 * Validate string is not empty
 */
export const validateNonEmptyString = (fieldName: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const value = req.body[fieldName];

		if (typeof value !== "string") {
			return res.status(400).json({
				error: `Field '${fieldName}' must be a string`,
				received: typeof value
			});
		}

		if (value.trim().length === 0) {
			return res.status(400).json({
				error: `Field '${fieldName}' cannot be empty`
			});
		}

		next();
	};
};

/**
 * Generic error handler middleware
 * Should be added at the end of the middleware chain
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error("Error:", err);

	if (err instanceof ValidationError) {
		return res.status(err.statusCode).json({
			error: err.message,
			details: err.details
		});
	}

	// Default error
	res.status(500).json({
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? err.message : undefined
	});
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
