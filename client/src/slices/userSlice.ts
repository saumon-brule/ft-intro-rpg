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
			state.roles = [...action.payload.roles];
			state.loggedIn = true;
		},
		logout(state) {
			fetch("/api/auth/logout", { method: "POST" })
				.then((response) => {
					if (!response.ok) throw new Error("suicide toi en vrai");
				})
				.catch(console.error);
			state.id = -1;
			state.login = "";
			state.image = "";
			state.roles = [];
			state.loggedIn = false;
		}
	}
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
