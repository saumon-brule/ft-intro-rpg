import type { RootState } from "../../store";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireRole({ role, fallback }: { role: string, fallback: ReactNode }) {
	const user = useSelector((state: RootState) => state.user);

	if (!user.roles.includes(role))
		return fallback;
	return <Outlet />;
}
