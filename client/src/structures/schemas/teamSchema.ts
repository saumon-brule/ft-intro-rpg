import { z } from "zod"

export const teamSchema = z.object({
	id: z.number(),
	guild: z.object({
		id: z.number(),
		name: z.string(),
		image: z.string(),
		motto: z.string(),
		description: z.string(),
		primary_color: z.string(),
		place: z.string(),
		old_job: z.string(),
		created_at: z.string(),
		updated_at: z.string()
	}),
	xp: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
	members: z.array(
		z.object({
			team_id: z.number(),
			user_id: z.number(),
			joined_at: z.string()
		})
	)
}).transform((data) => ({
	name: data.guild.name,
	image: data.guild.image,
	xp: data.xp,
	members: [
		data.members.map((member) => member.user_id)
	]
}));

export type Team = z.infer<typeof teamSchema>;
