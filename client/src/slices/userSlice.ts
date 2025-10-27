import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from "../structures/schemas/usersMeSchema";

export type UserState = User & { loggedIn: boolean };

const initialState: UserState = {
	id: -1,
	login: "",
	image: "",
	roles: [],
	loggedIn: false
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		login(state, action: PayloadAction<User>) {
			state.id = action.payload.id;
			state.login = action.payload.login;
			state.image = action.payload.image;
			state.roles = action.payload.roles;
			state.loggedIn = true;
		},
		logout(state) {
			state.id = -1;
			state.login = "";
			state.image = "";
			state.roles = [];
			state.loggedIn = false;
			// fetch("/api/logout");
		}
	}
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
