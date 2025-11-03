import { useSelector } from "react-redux";
import { useTeam } from "../../../../hooks/useTeam";
import type { RootState } from "../../../../store/store";

import { levelFromXp, xpForLevel } from "../../../../utils/xpCalc";

import "./TeamProfile.css";

export default function TeamProfile() {
	const loading = useTeam();

	const team = useSelector((state: RootState) => state.team);


	if (loading) return null;
	if (team.id < 0) return null;

	(window as (typeof window & { lvlfromxp: typeof levelFromXp })).lvlfromxp = levelFromXp;
	(window as (typeof window & { xpforlvl: typeof xpForLevel })).xpforlvl = xpForLevel;

	const level = levelFromXp(team.xp);
	const levelXp = xpForLevel(level);

	return <div id="team-profile">
		<h3 className="team-name">{team.name}</h3>
		<div className="team-level">
			<span className="team-level">niveau : {level}</span>
			<div className="progress-bar">
				<div className="progress-zone" style={{ "width": `${(team.xp - levelXp) / (xpForLevel(level + 1) - levelXp) * 100}%` }} />
				<span className="team-xp">{team.xp - levelXp} / {xpForLevel(level + 1) - levelXp}</span>
			</div>
		</div>
	</div>;
}
