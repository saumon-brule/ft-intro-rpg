import { useSelector } from "react-redux";
import PlayerHeader from "./header/PlayerHeader";
import type { RootState } from "../../../store/store";
import { useTeam } from "../../../hooks/useTeam";
import Quest from "./quest/Quest";

import "./PlayPage.css";
import type { GameStatus } from "../../../structures/schemas/gameStatusSchema";
import { useGameStatus } from "../../../hooks/useGameStatus";

function getNoTeamDisplayMessage(gameStatus: GameStatus) {
	switch (gameStatus) {
		case "idle":
			return "Le jeu n'a pas encore commencé, dîtes à tous vos amis de rejoindre";
		case "started":
			return "Vous n'avez visiblement pas de groupe, maheureusement la guilde ne peut pas vous assigner de quête sans groupe";
		case "finished":
			return "Le jeu est terminé. Merci beaucoup d'avoir joué !";;
	}
}

export default function PlayPage() {
	const team = useSelector((state: RootState) => state.team.userTeam);
	const gameStatus = useSelector((state: RootState) => state.game.status);

	let loading = false;
	if (useTeam()) loading = true;
	if (useGameStatus()) loading = true;

	if (loading) return null;

	return <div id="play-page">
		<PlayerHeader />
		{team
			? <Quest />
			: <p>{gameStatus ? getNoTeamDisplayMessage(gameStatus): ""}</p>}
	</div>;
}
