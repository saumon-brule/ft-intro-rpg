import PlayerProfile from "./PlayerProfile";
import TeamProfile from "./TeamProfile";

import "./PlayerHeader.css";

export default function PlayerHeader() {
	return <header id="player-header">
		<PlayerProfile/>
		<TeamProfile />
	</header>;
}
