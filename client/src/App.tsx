import { useAuth } from "./hooks/useAuth";

import Loading from "./components/Loading";
import { Outlet } from "react-router-dom";
import { socket } from "./socket/socket";
import { useEffect } from "react";

import "./App.css";

export default function App() {
	const loading = useAuth();

	console.log(socket);
	useEffect(() => {
		socket.on("admin:message", console.log);

		return () => {
			socket.off("admin:message");
		};
	}, []);


	if (loading) return <Loading />;
	return <Outlet />;
}
