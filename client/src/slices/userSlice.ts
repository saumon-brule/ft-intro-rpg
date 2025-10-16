import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface loginData {
	login: string
};

interface UserState {
	login: string,
	loggedIn: boolean
};

const initialState: UserState = {
	login: "",
	loggedIn: false
};

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		login(state, action: PayloadAction<loginData>) {
			state.login = action.payload.login;
			state.loggedIn = true;
		},
		logout(state) {
			state.login = "";
			state.loggedIn = false;
		}
	}
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
