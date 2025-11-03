import { useSelector } from "react-redux";
import { useQuest } from "../../../../hooks/useQuest";
import Timer from "../../../generic/Timer";
import type { RootState } from "../../../../store/store";
import type { QuestStatus } from "../../../../structures/schemas/questStatusSchema";

function getStatusDisplayInfo(gameStatus: QuestStatus) {
	switch (gameStatus) {
		case "idle":
			return "Le jeu n'a pas encore commencé, dîtes à tous vos amis de rejoindre";
		case "finished":
			return <>Vous avez terminé TOUTES les quêtes ?<br />Bravo !</>;
		case "waiting":
			return "Vous n'avez aucune quête pour le moment. Soyez patient, vous pourrez bientôt montrer votre valeure";
		case "closed":
			return "Le jeu est terminé. Merci beaucoup d'avoir joué !";
	}
}

import "./Quest.css";

export default function Quest() {
	const loading = useQuest();
	const {
		activeQuest: quest,
		status: questStatus
	} = useSelector((state: RootState) => state.quest);

	return <div className="quest-container">
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
				: <div>{questStatus ? getStatusDisplayInfo(questStatus) : ""}</div>
			: <div>Chargement ...</div>
		}
	</div>;
}
