import { z } from "zod";
import type { UserRole } from "../UserRole";

export const usersMeSchema = z.object({
	id: z.number(),
	id42: z.number(),
	login: z.string(),
	image: z.string(),
	pool_month: z.string(),
	pool_year: z.string(),
	permission: z.number(),
	team_id: z.number().nullable(),
	created_at: z.any(),
	updated_at: z.any()
}).transform((data) => {
	const roles: UserRole[] = [];
	switch (data.permission) {
		case 2:
			roles.push("admin");
			roles.push("pnj");
			roles.push("player");
			break;
		case 1:
			roles.push("pnj");
			break;
		case 0:
			roles.push("player");
			break;
	}

	return {
		id: data.id,
		login: data.login,
		image: data.image,
		roles: roles,
		teamId: data.team_id
	};
});

export type User = z.infer<typeof usersMeSchema>;
