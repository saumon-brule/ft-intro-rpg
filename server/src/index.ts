import { FtApp, AuthenticatedRequest } from "@saumon-brule/ft.js";
import { configDotenv } from "dotenv";
import express, { Response } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

configDotenv({ quiet: true });

if (!process.env.FT_APP_UID || !process.env.FT_APP_SECRET) {
	console.error("Invalid FT_APP_UID or FT_APP_SECRET environment variables");
	process.exit(1);
}

const JWT_SECRET = process.env.JWT_TOKEN ?? "SECRET";

type UserJwtPayload = { id: number };

process.on("uncaughtException", (error) => {
	console.trace(error);
});

const ftApp = new FtApp([{ uid: process.env.FT_APP_UID, secret: process.env.FT_APP_SECRET, redirectURI: "http://localhost:3000/api/auth/callback" }]);
const expressApp = express();

expressApp.use(cookieParser());

const apiRouter = express.Router();


function checkJwtPayload(payload: unknown): payload is UserJwtPayload {
	return typeof payload === "object"
		&& payload !== null
		&& "id" in payload
		&& typeof payload?.id === "number";
}

apiRouter.get("/auth", ftApp.userManager.authenticate());

apiRouter.get("/auth/callback",
	ftApp.userManager.callback({ errorPage: "/auth/error" }),
	(req: AuthenticatedRequest, res: Response) => {
		const user = req.user;
		if (!user) {
			res.redirect("/auth/error");
			throw new Error("Expected user not found");
		}
		const userJwt = jwt.sign({ id: user?.id }, JWT_SECRET, { expiresIn: "1d" });
		res.cookie("token", userJwt, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			maxAge: 1000 * 60 * 60 * 24
		});
		res.redirect("/");
	}
);

expressApp.use("/api", apiRouter);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const hostname = process.env.HOSTNAME ?? "localhost";

expressApp.listen(port, hostname, () => {
	console.log(`Server started on http://${hostname}:${port}`);
});
