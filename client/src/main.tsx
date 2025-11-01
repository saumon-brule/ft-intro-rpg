import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import "./index.css";
import Router from "./Router.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<Router/>
		</Provider>
	</StrictMode>
);
