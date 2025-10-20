import { AuthenticatedRequest } from "@saumon-brule/ft.js";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/database";

const JWT_SECRET = process.env.JWT_TOKEN ?? "SECRET";

export type UserJwtPayload = { id: number };

export function checkJwtPayload(payload: unknown): payload is UserJwtPayload {
	return typeof payload === "object"
		&& payload !== null
		&& "id" in payload
		&& typeof payload?.id === "number";
}

export const authCallback = (req: AuthenticatedRequest, res: Response) => {
	const user = req.user;
	// console.log(user);
	if (!user) {
		res.redirect("/auth/error");
		throw new Error("Expected user not found");
	}

	user.httpClient.get("/v2/me").then(async (response) => {
		if (response.status !== 200) {
			res.redirect("/auth/error");
			throw new Error("Failed to fetch user data");
		}
		const userData = await response.json();

		const login = userData.login;
		const picture = userData.image.versions.medium;
		const pool_month = userData.pool_month;
		const pool_year = userData.pool_year;

		// console.log({ id42: user?.id, login, picture, pool_month, pool_year });

		try {
			// Find or create user in database
			const dbUser = await db.findOrCreateUser({
				id42: user.id,
				login: login,
				image: picture,
				pool_month: pool_month,
				pool_year: pool_year
			});

			// console.log("User from database:", dbUser);

			// Use the database user id for JWT instead of id42
			const userJwt = jwt.sign({ id: dbUser.id }, JWT_SECRET, { expiresIn: "1d" });
			res.cookie("token", userJwt, {
				httpOnly: true,
				secure: true,
				sameSite: "strict",
				maxAge: 1000 * 60 * 60 * 24
			});
			res.redirect("/");
		} catch (error) {
			console.error("Database error:", error);
			res.redirect("/auth/error");
		}
	});
};
