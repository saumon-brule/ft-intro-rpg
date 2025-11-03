import { useSelector } from "react-redux";
import { useQuest } from "../../../hooks/useQuest";
import PlayerHeader from "./header/PlayerHeader";
import type { RootState } from "../../../store/store";
import type { GameStatus } from "../../../structures/schemas/gameStatusSchema";
import Timer from "../../generic/Timer";

import "./PlayPage.css";

function getStatusDisplatInfo(gameStatus: GameStatus) {
	switch (gameStatus) {
		case "idle":
			return "Le jeu n'a pas encore commencé, dîtes à tous vos amis de rejoindre";
		case "finished":
			return <>Vous avez terminé TOUTES les quêtes ?<br />Bravo !</>;
		case "waiting":
			return "Vous n'avez aucune quête pour le moment. Soyez patient, vous pourrez bientôt montrer votre valeure";
	}
}

export default function PlayPage() {
	const loading = useQuest();
	const quest = useSelector((state: RootState) => state.quest.activeQuest);
	const gameStatus = useSelector((state: RootState) => state.game.status);

	return <div id="play-page">
		<PlayerHeader />
		<div className="quest-container">
			{!loading
				? quest
					? <div className="quest">
						<header>
							<h2 className="quest-title">{quest.name}</h2>
							<div className="quest-detail">
								<span className="quest-timer">
									<span>Timer : </span>
									<Timer until={new Date(quest.endsAt)} />
								</span>
								<span className="quest-place">Lieu : {quest.place}</span>
							</div>
						</header>
						<hr />
						<main>
							<p className="quest-lore">{quest.lore}</p>
							<p className="quest-clue">{quest.clue}</p>
						</main>
						<hr />
						<footer>
							<p className="quest-reward">Reward : <span className="quest-reward-value">{quest.xp}</span> xp</p>
						</footer>
					</div>
					: <div>{gameStatus ? getStatusDisplatInfo(gameStatus) : ""}</div>
				: <div>Chargement ...</div>
			}
		</div>
	</div>;
}
