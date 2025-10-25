import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { logout } from "../../../slices/userSlice";

export default function Home() {
	const login = useSelector((state: RootState) => state.user.login);
	const dispatch = useDispatch<AppDispatch>();

	return <div>
		Bonjour {login} !
		<button onClick={() => dispatch(logout())}>logout</button>
	</div>;
}
