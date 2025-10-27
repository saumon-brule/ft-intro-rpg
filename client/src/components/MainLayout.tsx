import { Outlet } from "react-router-dom";

import "./MainLayout.css";
import Overlay from "./overlay/Overlay";

export default function MainLayout() {
	return <div id="app">
		<main id="app-content">
			<Outlet />
		</main>
		<div id="overlay">
			<Overlay />
		</div>
	</div>;
}
