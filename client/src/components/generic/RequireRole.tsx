import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserRole } from "../../structures/UserRole";

export default function RequireRole({ role, fallback }: { role: UserRole, fallback: ReactNode }) {
	const user = useSelector((state: RootState) => state.user);

	if (!user.roles.includes(role))
		return fallback;
	return <Outlet />;
}
