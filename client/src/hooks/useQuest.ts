import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch } from "../store/store";
import { FetchError } from "../structures/FetchError";
import { socket } from "../socket/socket";
import { setQuestStatus } from "../store/slices/questSlice";
import { activeQuestSchema } from "../structures/schemas/activeQuestSchema";
import { setActiveQuest } from "../store/slices/questSlice";
import { setXp } from "../store/slices/teamSlice";
import { assignedActiveQuestSchema } from "../structures/schemas/assignedActiveQuest";

export function useQuest() {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		fetch("/api/active-quests/me")
			.then(async (response) => {
				let data;
				try {
					data = await response.json();
				} catch {
					throw new FetchError(`HTTP Error: ${response.status}`, response.status);
				}
				if (!response.ok) {
					if (response.status === 401) {
						return;
					}
					throw new FetchError(data?.error ?? `HTTP Error: ${response.status}`, response.status);
				}
				console.log(data);
				const activeQuestData = activeQuestSchema.parse(data);
				dispatch(setQuestStatus(activeQuestData.gameStatus));
				dispatch(setActiveQuest(activeQuestData.quest));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
		socket.on("active_quest:assigned", (data) => {
			const assignedActiveQuestData = assignedActiveQuestSchema.parse(data);
			dispatch(setQuestStatus(assignedActiveQuestData.gameStatus));
			dispatch(setXp(assignedActiveQuestData.newXp));
			dispatch(setActiveQuest(assignedActiveQuestData.quest));
		});
		return () => {
			socket.off("active_quest:assigned");
		};
	}, [dispatch]);

	if (error) throw error;
	return loading;
}
