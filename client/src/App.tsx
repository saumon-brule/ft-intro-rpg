import { useAuth } from "./hooks/useAuth";

import Loading from "./components/Loading";
import { Outlet } from "react-router-dom";

import "./App.css";

export default function App() {
	const loading = useAuth();

	if (loading) return <Loading />;
	return <Outlet />;
}
