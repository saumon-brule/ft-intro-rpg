import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch } from "../store/store";
import { FetchError } from "../structures/FetchError";
import { endQuest, setQuest } from "../store/slices/teamSlice";
import { questSchema, type Quest } from "../structures/schemas/questSchema";
import { socket } from "../socket/socket";
import { assignedQuestSchema } from "../structures/schemas/assignedQuestSchema";
import { questEndSchema } from "../structures/schemas/questStatusSchema";

export function useQuest(onSuccess: (quest: Quest) => void, onFail: (quest: Quest) => void) {
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
				dispatch(setQuest(assignedQuestSchema.parse(data)));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
		socket.on("active_quest:assigned", console.log);
		socket.on("active_quest:status", (data: unknown) => {
			const message = questEndSchema.parse(data).message;
			dispatch(endQuest(message === "finished"));
		});
		return () => {
			socket.off("active_quest:assigned");
			socket.off("active_quest:status");
		};
	}, [dispatch]);

	if (error) throw error;
	return loading;
}
