import { z } from "zod";
import { questSchema } from "./questSchema";

export const assignedQuestSchema = z.object({
	active_quest: z.object({
		id: z.number(),
		quest_id: z.number(),
		team_id: z.number(),
		ends_at: z.iso.datetime(),
		status: z.enum(["in_progress", "finished"]),
		validated: z.number()
	}),
	quest: questSchema
}).transform((data) => ({
	...data.quest,
	endDate: data.active_quest.ends_at,
	status: data.active_quest.status,
	validated: data.active_quest.validated
}));

export type AssignedQuest = z.infer<typeof assignedQuestSchema>;
