import { FtApp } from "@saumon-brule/ft.js";
import { configDotenv } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { createAuthRouter } from "./routes/auth";
import { createUserRouter } from "./routes/users";
import { verifyToken } from "./middlewares/auth";
import { errorHandler } from "./middlewares/validation";
import guildsRouter from "./routes/guilds";
import teamsRouter from "./routes/teams";

configDotenv({ quiet: true });

if (!process.env.FT_APP_UID || !process.env.FT_APP_SECRET) {
	console.error("Invalid FT_APP_UID or FT_APP_SECRET environment variables");
	process.exit(1);
}

process.on("uncaughtException", (error) => {
	console.trace(error);
});

const ftApp = new FtApp([{ uid: process.env.FT_APP_UID, secret: process.env.FT_APP_SECRET, redirectURI: "http://localhost:3000/api/auth/callback" }]);
const expressApp = express();

expressApp.use(cookieParser());
expressApp.use(express.json());

const apiRouter = express.Router();
const authRouter = createAuthRouter(ftApp);
const userRouter = createUserRouter();

// Auth routes (public)
apiRouter.use("/auth", authRouter);
// User routes (requires authentication, verified in each route)
apiRouter.use("/users", verifyToken, userRouter);
// Guild routes (requires authentication, verified in each route)
apiRouter.use("/guilds", guildsRouter);
// Team routes (requires authentication, verified in each route)
apiRouter.use("/teams", teamsRouter);

expressApp.use("/api", apiRouter);

// Global error handler (must be after all routes)
expressApp.use(errorHandler);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const hostname = process.env.HOSTNAME ?? "localhost";

expressApp.listen(port, hostname, () => {
	console.log(`Server started on http://${hostname}:${port}`);
});
