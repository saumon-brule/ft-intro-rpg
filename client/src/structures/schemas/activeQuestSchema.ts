import { z } from "zod";
import { questSchema } from "./questSchema";
import { gameStatusSchema } from "./gameStatusSchema";

export const activeQuestSchema = z.object({
	active_quest: z.object({
		ends_at: z.string()
	}),
	quest: questSchema,
	newXp: z.number(),
	status: gameStatusSchema
}).transform((data) => ({
	...data.quest,
	endsAt: data.active_quest.ends_at,
	newXp: data.newXp,
	gameStatus: data.status
}));

export type ActiveQuest = z.infer<typeof activeQuestSchema>;
