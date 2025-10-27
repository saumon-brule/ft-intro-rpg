import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App";
import PlayPage from "./components/routes/play/PlayPage";
import Login from "./components/routes/login/Login";
import ErrorPage from "./components/errors/ErrorPage";
import RequireRole from "./components/generic/RequireRole";
import Error404 from "./components/errors/Error404";
import AdminHome from "./components/routes/admin/Home";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import type { UserState } from "./slices/userSlice";
import MainLayout from "./components/MainLayout";

function getRootPath(user: UserState) {
	if (!user.loggedIn)
		return "/login";
	if (user.roles.includes("admin"))
		return "/admin";
	if (user.roles.includes("pnj"))
		return "/quest";
	return "/play";
}

export default function Router() {

	const user = useSelector((state: RootState) => state.user);

	const router = createBrowserRouter([
		{
			path: "/",
			element: <App />,
			errorElement: <ErrorPage />,
			children: [
				{
					index: true,
					element: <Navigate to={getRootPath(user)} replace />
				},
				{
					element: <MainLayout/>,
					children: [
						{
							path: "login",
							element: !user.loggedIn ? <Login /> : <Navigate to="/login" replace />
						},
						{
							path: "admin",
							element: user.loggedIn ? <RequireRole role={"admin"} fallback={<Error404 />} /> : <Navigate to="/login" replace />,
							children: [
								{
									index: true,
									element: <AdminHome />
								}
							]
						},
						{
							path: "play",
							element: user.loggedIn ? <PlayPage /> : <Navigate to="/login" replace />
						}
					]
				}
			]
		}
	]);

	return <RouterProvider router={router} />;
}
