import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PopUpParams } from "../../structures/PopUpParams";

export type PopUpState = (PopUpParams & { id: number })[];

const initialState: PopUpState = [];

let nextId = 0;

const popUpsSlice = createSlice({
	name: "popUps",
	initialState,
	reducers: {
		createPopUp(state, action: PayloadAction<PopUpParams>) {
			state.push({ ...action.payload, id: nextId });
			nextId++;
		},
		deletePopUp(state, action: PayloadAction<number>) {
			return state.filter((popUpParams) => popUpParams.id !== action.payload);
		}
	}
});

export const { createPopUp, deletePopUp } = popUpsSlice.actions;
export default popUpsSlice.reducer;
