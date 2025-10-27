import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { logout } from "../../../slices/userSlice";
import Profile from "../../overlay/Profile";

import "./PlayPage.css";

export default function PlayPage() {
	const login = useSelector((state: RootState) => state.user.login);
	const dispatch = useDispatch<AppDispatch>();

	return <div id="play-page">
		<header>
			<Profile/>
		</header>
		Bonjour {login} !
		<button onClick={() => dispatch(logout())}>logout</button>
	</div>;
}
