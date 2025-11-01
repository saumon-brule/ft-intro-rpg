import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";

import "./PlayerProfile.css";

export default function PlayerProfile() {
	const user = useSelector((state: RootState) => state.user);

	return <button id="profile-button" style={{ "--profile-picture": `url("${user.image}")` } as React.CSSProperties} />;
}
