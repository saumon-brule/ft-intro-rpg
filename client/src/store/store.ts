import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import teamReducer from "./slices/teamSlice";
import gameReducer from "./slices/gameSlice";
import questReducer from "./slices/questSlice";
import popUpsReducer from "./slices/popUpsSlice";

export const store = configureStore({
	reducer: {
		user: userReducer,
		team: teamReducer,
		game: gameReducer,
		quest: questReducer,
		popUps: popUpsReducer
	}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
