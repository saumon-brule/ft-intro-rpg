import { z } from "zod";

export const questEndSchema = z.object({
	message: z.string()
});

export type QuestEndMessage = z.infer<typeof questEndSchema>;
