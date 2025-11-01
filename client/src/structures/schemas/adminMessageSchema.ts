import { z } from "zod";

export const adminMessageSchema = z.object({
	message: z.string()
}).transform((data) => ({
	title: "Avis à tous les aventuriers !",
	subtitle: "Message du Roi",
	message: data.message
}));

export type AdminMessage = z.infer<typeof adminMessageSchema>;
