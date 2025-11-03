import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { logout } from "./userSlice";
import type { ActiveQuest } from "../../structures/schemas/activeQuestSchema";
import type { QuestStatus } from "../../structures/schemas/questStatusSchema";

type ActiveQuestState = {
	activeQuest: ActiveQuest | null,
	status: QuestStatus | undefined
};

const initialState: ActiveQuestState = {
	activeQuest: null,
	status: undefined
};

const activeQuestSlice = createSlice({
	name: "activeQuest",
	initialState,
	reducers: {
		setActiveQuest(state, action: PayloadAction<ActiveQuest>) {
			state.activeQuest = action.payload;
		},
		setQuestStatus(state, action: PayloadAction<QuestStatus>) {
			state.status = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logout, () => initialState);
	}
});

export const { setActiveQuest, setQuestStatus } = activeQuestSlice.actions;
export default activeQuestSlice.reducer;
