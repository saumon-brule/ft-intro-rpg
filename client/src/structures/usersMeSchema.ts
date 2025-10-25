import { z } from "zod";

export const usersMeSchema = z.object({
	id: z.number(),
	id42: z.number(),
	login: z.string(),
	image: z.string(),
	pool_month: z.string(),
	pool_year: z.string(),
	permission: z.number(),
	created_at: z.any(),
	updated_at: z.any()
}).transform((data) => ({
	id: data.id,
	login: data.login,
	image: data.image,
	permission: data.permission
}));

export type User = z.infer<typeof usersMeSchema>;
