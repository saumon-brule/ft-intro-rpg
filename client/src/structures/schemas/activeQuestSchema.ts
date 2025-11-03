import { z } from "zod";
import { questSchema } from "./questSchema";
import { questStatusSchema } from "./questStatusSchema";


export const activeQuestSchema = z.object({
	active_quest: z.object({
		ends_at: z.string()
	}).nullable(),
	quest: questSchema.nullable(),
	gameStatus: questStatusSchema
}).transform((data) => ({
	quest: data.active_quest && data.quest && {
		...data.quest,
		endsAt: data.active_quest.ends_at
	},
	gameStatus: data.gameStatus
}));

export type ActiveQuest = z.infer<typeof activeQuestSchema>["quest"];
export type ActiveQuestData = z.infer<typeof activeQuestSchema>;
