import { z } from "zod";

export const adminMessageSchema = z.object({
	title: z.string(),
	subtitle: z.string(),
	content: z.string()
}).transform((data) => ({
	title: "Avis à tous les aventuriers !",
	subtitle: "Message du Roi",
	message: data.content
}));

export type AdminMessage = z.infer<typeof adminMessageSchema>;
