import { z } from "zod";

export const questSchema = z.object({
	id: z.number(),
	name: z.string(),
	place: z.string(),
	clue: z.string(),
	lore: z.string(),
	time_limit: z.number(),
	pnj_id: z.number().nullable(),
	xp: z.number(),
	created_at: z.any(),
	updated_at: z.any()
}).transform((data) => {
	return {
		id: data.id,
		name: data.name,
		place: data.place,
		clue: data.clue,
		lore: data.lore,
		pnjId: data.pnj_id,
		xp: data.xp
	};
});

export type Quest = z.infer<typeof questSchema>;
