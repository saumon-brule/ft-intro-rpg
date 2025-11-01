import z from "zod";

//                                                     quest      game not  no quest
//                                       game end      active     started    active
export const gameStatusSchema = z.enum(["finished", "in_progress", "idle", "waiting"]);

export type GameStatus = z.infer<typeof gameStatusSchema>;
