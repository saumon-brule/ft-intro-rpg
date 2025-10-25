import type { RootState } from "../../store";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({ role, fallback }: { role: number, fallback: ReactNode }) {
	const user = useSelector((state: RootState) => state.user);

	if (user || role)
		return fallback;
	return <Outlet />;
}
