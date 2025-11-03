import z from "zod";

//                                       all quest       quest      game not  no quest
//                                       completed       active     started   active    game end
export const questStatusSchema = z.enum(["finished", "in_progress", "idle", "waiting", "closed"]);

export type QuestStatus = z.infer<typeof questStatusSchema>;
