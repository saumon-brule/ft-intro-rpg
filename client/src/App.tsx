import { useState, useEffect, useRef } from "react";
import type { RootState, AppDispatch } from "./store";
import { login } from "./slices/userSlice";
import { useDispatch, useSelector } from "react-redux";

import Loading from "./components/Loading";
import Home from "./components/Home";
import Login from "./components/Login";

import "./App.css";

export default function App() {
	const [loading, setLoading] = useState(true);
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch<AppDispatch>();

	const timeoutId = useRef<number>(null);

	useEffect(() => {
		setTimeout(() => setLoading(false), 2000);
		dispatch(login({ login: "coucou" }));
		return () => {
			if (timeoutId.current != null) {
				clearTimeout(timeoutId.current);
				timeoutId.current = null;
			}
		};
	}, [dispatch]);

	return <>
		{loading
			? <Loading />
			: user.loggedIn
				? <Home />
				: <Login />
		}
	</>;
}
