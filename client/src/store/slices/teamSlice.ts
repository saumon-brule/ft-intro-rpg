import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Team } from "../../structures/schemas/teamSchema";
import { logout } from "./userSlice";
import type { Quest } from "../../structures/schemas/questSchema";

export type TeamState = Team & { quest: Quest | null };

const initialState: TeamState = {
	id: -1,
	name: "",
	image: "",
	xp: -1,
	members: [],
	quest: null
};

const teamSlice = createSlice({
	name: "team",
	initialState,
	reducers: {
		setTeam: (_, action: PayloadAction<TeamState>) => structuredClone(action.payload),
		setQuest(state, action: PayloadAction<Quest>) {
			state.quest = structuredClone(action.payload);
		},
		endQuest(state, action: PayloadAction<{ success: boolean, newQuest: Quest | null }>) {
			state.quest = structuredClone(action.payload.newQuest);
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logout, () => initialState);
	}
});

export const { setTeam, setQuest } = teamSlice.actions;
export function endQuest(success: boolean, newQuest?: Quest) {
	return teamSlice.actions.endQuest({ success, newQuest: newQuest ?? null });
}
export default teamSlice.reducer;
