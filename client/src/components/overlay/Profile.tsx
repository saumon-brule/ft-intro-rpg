import { useSelector } from "react-redux";
import type { RootState } from "../../store";

import "./Profile.css";

export default function Profile() {
	const user = useSelector((state: RootState) => state.user);

	return <button id="profile-button" style={{ "backgroundImage": `url("${user.image}")` }} />;
}
