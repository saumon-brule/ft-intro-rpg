import { Outlet, useLocation } from "react-router-dom";
import Overlay from "./overlay/Overlay";

import "./MainLayout.css";

export default function MainLayout() {
	const location = useLocation();

	return <div id="app">
		<div id="app-content" className={location.pathname.includes("play") ? "play-page" : ""}>
			<Outlet />
		</div>
		<div id="overlay">
			<Overlay />
		</div>
	</div>;
}
