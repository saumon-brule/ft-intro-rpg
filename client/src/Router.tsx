import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App";
import Play from "./components/routes/play/Play";
import Login from "./components/routes/login/Login";
import ErrorPage from "./components/errors/ErrorPage";
import RequireRole from "./components/generic/RequireRole";
import Error404 from "./components/errors/Error404";
import AdminHome from "./components/routes/admin/Home";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

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
					element: <Navigate to={!user.loggedIn ? "/login" : user.permission === 0 ? "/play" : user.permission === 1 ? "/quest" : "/admin"} replace />
				},
				{
					path: "login",
					element: !user.loggedIn ? <Login /> : <Navigate to="/login" replace />
				},
				{
					path: "admin",
					element: user.loggedIn ? <RequireRole role={2} fallback={<Error404 />} /> : <Navigate to="/login" replace />,
					children: [
						{
							index: true,
							element: <AdminHome />
						}
					]
				},
				{
					path: "play",
					element: user.loggedIn ? <Play /> : <Navigate to="/login" />
				}
			]
		}
	]);

	return <RouterProvider router={router} />;
}
