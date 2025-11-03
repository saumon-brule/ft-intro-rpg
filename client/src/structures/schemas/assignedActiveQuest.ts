import { z } from "zod";
import { questSchema } from "./questSchema";
import { gameStatusSchema } from "./gameStatusSchema";

export const assignedActiveQuestSchema = z.object({
	active_quest: z.object({
		ends_at: z.string()
	}).nullable(),
	quest: questSchema.nullable(),
	newXp: z.number(),
	gameStatus: gameStatusSchema
}).transform((data) => ({
	quest: data.active_quest && data.quest && {
		...data.quest,
		endsAt: data.active_quest.ends_at
	},
	newXp: data.newXp,
	gameStatus: data.gameStatus
}));

export type AssignedActiveQuest = z.infer<typeof assignedActiveQuestSchema>["quest"];
export type ActiveQuestData = z.infer<typeof assignedActiveQuestSchema>;
