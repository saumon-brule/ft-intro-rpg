import { FtApp } from "@saumon-brule/ft.js";
import express from "express";
import { authCallback } from "../controllers/auth";

export function createAuthRouter(ftApp: FtApp) {
	const router = express.Router();

	router.get("/", ftApp.userManager.authenticate());

	router.get("/callback",
		ftApp.userManager.callback({ errorPage: "/auth/error" }),
		authCallback
	);

	return router;
}
