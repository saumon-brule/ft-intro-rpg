import { FtApp } from "@saumon-brule/ft.js";
import { configDotenv } from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket";
import { processExpiredActiveQuests } from "./activeQuestProcessor";
import { scheduleAllActiveQuests } from "./activeQuestScheduler";
import { createAuthRouter } from "./routes/auth";
import { createUserRouter } from "./routes/users";
import { verifyToken } from "./middlewares/auth";
import { errorHandler } from "./middlewares/validation";
import guildsRouter from "./routes/guilds";
import teamsRouter from "./routes/teams";
import eventsRouter from "./routes/events";
import questsRouter from "./routes/quests";
import activeQuestsRouter from "./routes/activeQuests";
import adminRouter from "./routes/admin";

configDotenv({ quiet: true });

if (!process.env.FT_APP_UID || !process.env.FT_APP_SECRET) {
	console.error("Invalid FT_APP_UID or FT_APP_SECRET environment variables");
	process.exit(1);
}

process.on("uncaughtException", (error) => {
	console.trace(error);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const protocol = process.env.PROTOCOL ?? "http";
const hostname = process.env.HOSTNAME ?? "localhost";

const ftApp = new FtApp([{ uid: process.env.FT_APP_UID, secret: process.env.FT_APP_SECRET, redirectURI: `${protocol}://${hostname}:${port}/api/auth/callback` }]);
export { ftApp };

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
// Events routes (admin)
apiRouter.use("/event", eventsRouter);
// Quests routes (admin for mutate endpoints)
apiRouter.use("/quests", questsRouter);
// Active quests routes
apiRouter.use("/active-quests", activeQuestsRouter);
// Admin routes (debug)
apiRouter.use("/debug", adminRouter);

expressApp.use("/api", apiRouter);

// Global error handler (must be after all routes)
expressApp.use(errorHandler);

// Create HTTP server and attach socket.io
const server = http.createServer(expressApp);
initSocket(server);

// Start a periodic job to process expired active quests every 60 seconds (fallback)
// and run it once at startup. Also schedule in-memory timeouts for current active quests.
const EXPIRATION_POLL_MS = 60 * 1000;
setTimeout(() => {
	processExpiredActiveQuests().catch(err => console.error("Initial expired quest processing failed", err));
	// schedule all current in-progress active quests
	scheduleAllActiveQuests().catch(err => console.error("Failed to schedule active quests at startup", err));
}, 1000);
setInterval(() => {
	processExpiredActiveQuests().catch(err => console.error("Periodic expired quest processing failed", err));
}, EXPIRATION_POLL_MS);

server.listen(port, hostname, () => {
	console.log(`Server started on ${protocol}://${hostname}:${port}`);
});
