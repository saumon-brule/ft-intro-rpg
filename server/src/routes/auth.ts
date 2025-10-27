import { FtApp } from "@saumon-brule/ft.js";
import express from "express";
import { authCallback, logout } from "../controllers/auth";
import { requireAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/validation";

export function createAuthRouter(ftApp: FtApp) {
	const router = express.Router();

	router.get("/", ftApp.userManager.authenticate());

	router.get("/callback",
		ftApp.userManager.callback({ errorPage: "/auth/error" }),
		authCallback
	);

	router.post("/logout",
		requireAuth,
		asyncHandler(logout)
	);

	return router;
}
