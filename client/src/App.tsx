import { useAuth } from "./hooks/useAuth";

import Loading from "./components/Loading";

import "./App.css";
import { Outlet } from "react-router-dom";

export default function App() {
	const loading = useAuth();

	if (loading) return <Loading />;
	return <Outlet />;
}
