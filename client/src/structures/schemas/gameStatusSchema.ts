import z from "zod";

//                                                  game not  game
//                                       game end   started   started
export const gameStatusSchema = z.enum(["finished", "idle", "started"]);

export const gameStatusResponseSchema = z.object({
	status: gameStatusSchema
});

export type GameStatus = z.infer<typeof gameStatusSchema>;
