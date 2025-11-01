import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch } from "../store/store";
import { FetchError } from "../structures/FetchError";
import { socket } from "../socket/socket";
import { setStatus } from "../store/slices/gameSlice";
import { activeQuestSchema } from "../structures/schemas/activeQuestSchema";
import { setActiveQuest } from "../store/slices/questSlice";
import { setXp } from "../store/slices/teamSlice";

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
				const activeQuestData = activeQuestSchema.parse(data);
				dispatch(setStatus(activeQuestData.gameStatus));
				dispatch(setXp(activeQuestData.newXp));
				dispatch(setActiveQuest(activeQuestData));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
		socket.on("active_quest:assigned", (data) => {
			const activeQuestData = activeQuestSchema.parse(data);
			dispatch(setStatus(activeQuestData.gameStatus));
			dispatch(setXp(activeQuestData.newXp));
			dispatch(setActiveQuest(activeQuestData));
		});
		return () => {
			socket.off("active_quest:assigned");
		};
	}, [dispatch]);

	if (error) throw error;
	return loading;
}
