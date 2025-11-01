import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { logout } from "./userSlice";
import type { GameStatus } from "../../structures/schemas/gameStatusSchema";

export type Game = {
	status: GameStatus | undefined
};

type GameState = Game;

const initialState: GameState = {
	status: undefined
};

const gameSlice = createSlice({
	name: "game",
	initialState,
	reducers: {
		setStatus(state, action: PayloadAction<GameStatus>) {
			state.status = action.payload;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(logout, () => initialState);
	}
});

export const { setStatus } = gameSlice.actions;
export default gameSlice.reducer;
