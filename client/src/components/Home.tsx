import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { logout } from "../slices/userSlice";

export default function Home() {
	const login = useSelector((state: RootState) => state.user.login);
	const dispatch = useDispatch<AppDispatch>();

	const timeoutId = useRef<number>(null);

	useEffect(() => {
		timeoutId.current = setTimeout(() => {
			dispatch(logout());
		}, 3000);
		return () => {
			if (timeoutId.current != null) {
				clearTimeout(timeoutId.current);
				timeoutId.current = null;
			}
		};
	}, [dispatch]);

	return <div>Bonjour {login} !</div>;
}
