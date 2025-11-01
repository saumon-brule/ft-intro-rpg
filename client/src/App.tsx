import { useAuth } from "./hooks/useAuth";

import Loading from "./components/Loading";
import { Outlet } from "react-router-dom";
import { socket } from "./socket/socket";
import { useEffect } from "react";
import { adminMessageSchema } from "./structures/schemas/adminMessageSchema";
import type { AppDispatch } from "./store/store";
import { createPopUp } from "./store/slices/popUpsSlice";
import { useDispatch } from "react-redux";

import "./App.css";

export default function App() {
	const loading = useAuth();
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		socket.on("admin:message", (messageData) => {
			const { title, subtitle, message } = adminMessageSchema.parse(messageData);
			dispatch(createPopUp({ title, subtitle, content: message }));
		});

		return () => {
			socket.off("admin:message");
		};
	}, [dispatch]);


	if (loading) return <Loading />;
	return <Outlet />;
}
