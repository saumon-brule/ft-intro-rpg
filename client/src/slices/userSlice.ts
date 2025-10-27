import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from "../structures/schemas/usersMeSchema";

export type UserState = User & { loggedIn: boolean };

const initialState: UserState = {
	id: -1,
	login: "",
	image: "",
	roles: [],
	teamId: null,
	loggedIn: false
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		login: (_, action: PayloadAction<User>) => ({ ...structuredClone(action.payload), loggedIn: true }),
		logout() {
			fetch("/api/auth/logout", { method: "POST" })
				.then((response) => {
					if (!response.ok) throw new Error("suicide toi en vrai");
				})
				.catch(console.error);
			return initialState;
		}
	}
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
