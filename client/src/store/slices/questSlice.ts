import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { logout } from "./userSlice";
import type { ActiveQuest } from "../../structures/schemas/activeQuestSchema";

type ActiveQuestState = { activeQuest: ActiveQuest | null };

const initialState: ActiveQuestState = { activeQuest: null };

const activeQuestSlice = createSlice({
	name: "activeQuest",
	initialState,
	reducers: {
		setActiveQuest(state, action: PayloadAction<ActiveQuest>) {
			state.activeQuest = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logout, () => initialState);
	}
});

export const { setActiveQuest } = activeQuestSlice.actions;
export default activeQuestSlice.reducer;
