import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Team } from "../../structures/schemas/teamSchema";
import { logout } from "./userSlice";

export type UserTeam = Team | null;
type TeamState = { userTeam: UserTeam };

const initialState: TeamState = { userTeam: null };

const teamSlice = createSlice({
	name: "team",
	initialState,
	reducers: {
		setTeam(_, action: PayloadAction<UserTeam>) {
			return { userTeam: action.payload };
		},
		setXp(state, action: PayloadAction<number>) {
			if (state.userTeam) state.userTeam.xp = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logout, () => initialState);
	}
});

export const { setTeam, setXp } = teamSlice.actions;
export default teamSlice.reducer;
