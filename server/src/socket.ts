import http from "http";
import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "./db/database";

const JWT_SECRET = process.env.JWT_SECRET ?? "SECRET";

let io: IOServer | null = null;

// In-memory maps: userId -> Set<socketId>
const userSockets: Map<number, Set<string>> = new Map();

export function initSocket(server: http.Server) {
	if (io) return io;

	server.on("request", (req, res) => { });

	const port = process.env.FRONT_PORT ? parseInt(process.env.FRONT_PORT) : 3000;
	const protocol = process.env.FRONT_PROTOCOL ?? "http";
	const hostname = process.env.FRONT_HOSTNAME ?? "localhost";
	console.log(`Socket.io initializing (path=/ws) CORS reflecting origin`);
	io = new IOServer(server, {
		path: "/ws",
		cors: {
			// reflect the request origin so Access-Control-Allow-Origin is present and compatible with credentials
			origin: true,
			methods: ["GET", "POST"],
			credentials: true
		}
	});

	io.on("connection", async (socket: Socket) => {
		try {
			// Try token from handshake.auth first (explicit client-sent token)
			let token = socket.handshake.auth?.token as string | undefined;

			// If not present, try to read httpOnly cookie named 'token' from headers
			if (!token && socket.handshake.headers && socket.handshake.headers.cookie) {
				const raw = socket.handshake.headers.cookie as string;
				// simple cookie parse
				for (const part of raw.split(";")) {
					const [k, v] = part.split("=").map(s => s.trim());
					if (k === "token") {
						token = decodeURIComponent(v || "");
						break;
					}
				}
			}

			if (!token) {
				socket.disconnect(true);
				return;
			}

			const decoded = jwt.verify(token, JWT_SECRET) as any;
			if (!decoded || typeof decoded.id !== "number") {
				socket.disconnect(true);
				return;
			}

			const user = await db.findUserById(decoded.id);
			if (!user) {
				socket.disconnect(true);
				return;
			}

			// register socket
			const set = userSockets.get(user.id) ?? new Set<string>();
			set.add(socket.id);
			userSockets.set(user.id, set);

			// store on socket for cleanup
			(socket as any).userId = user.id;

			socket.emit("connected", { ok: true, user: { id: user.id, login: user.login } });

			socket.on("disconnect", () => {
				const uid = (socket as any).userId as number | undefined;
				if (!uid) return;
				const s = userSockets.get(uid);
				if (!s) return;
				s.delete(socket.id);
				if (s.size === 0) userSockets.delete(uid);
				else userSockets.set(uid, s);
			});
		} catch (err) {
			socket.disconnect(true);
		}
	});

	return io;
}

export function getIo() {
	if (!io) throw new Error("Socket.io not initialized");
	return io;
}

export function broadcastAdminMessage(title: string, subtitle: string, content: string) {
	if (!io) return;
	io.emit("admin:message", { title: String(title), subtitle: String(subtitle), content: String(content) });
}

export function getUserSocketIds(userId: number): string[] {
	const s = userSockets.get(userId);
	return s ? Array.from(s) : [];
}
