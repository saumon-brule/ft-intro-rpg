import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Team } from "../structures/schemas/teamSchema";
import { logout } from "./userSlice";

export type TeamState = Team;

const initialState: TeamState = {
	id: -1,
	name: "",
	image: "",
	xp: -1,
	members: []
};

const teamSlice = createSlice({
	name: "team",
	initialState,
	reducers: {
		setTeam: (_, action: PayloadAction<TeamState>) => structuredClone(action.payload)
	},
	extraReducers: (builder) => {
		builder.addCase(logout, () => initialState);
	}
});

export const { setTeam } = teamSlice.actions;
export default teamSlice.reducer;
