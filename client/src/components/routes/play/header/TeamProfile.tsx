import { useSelector } from "react-redux";
import { useTeam } from "../../../../hooks/useTeam"
import type { RootState } from "../../../../store";

import { levelFromXp, xpForLevel } from "../../../../utils/xpCalc";

import "./TeamProfile.css"

export default function TeamProfile() {
	const loading = useTeam();

	const team = useSelector((state: RootState) => state.team);

	console.log(12);

	if (loading) return <div className="team-profile loading">12356</div>
	if (!team) return <div className="team-profil no-team"> pas encore de team, attendez ca arrive</div>

	const level = levelFromXp(team.xp);
	const levelXp = xpForLevel(level);

	return <div id="team-profile">
		<h3 className="team-name">{team.name}</h3>
		<div className="progress-bar">
			<div className="progress-zone">
				<div className="progress-fill" style={{}}></div>
			</div>
			<span>{team.xp - levelXp} / {xpForLevel(level + 1) - levelXp}</span>
		</div>
	</div>;
}