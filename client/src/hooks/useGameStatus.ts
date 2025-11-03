import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch } from "../store/store";
import { FetchError } from "../structures/FetchError";
import { gameStatusResponseSchema } from "../structures/schemas/gameStatusSchema";
import { setGameStatus } from "../store/slices/gameSlice";

export function useGameStatus() {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		fetch("/api/event/status")
			.then(async (response) => {
				let data;
				try {
					data = await response.json();
				} catch {
					throw new FetchError(`HTTP Error: ${response.status}`, response.status);
				}
				if (!response.ok) {
					throw new FetchError(data?.error ?? `HTTP Error: ${response.status}`, response.status);
				}
				dispatch(setGameStatus(gameStatusResponseSchema.parse(data).status));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
	}, [dispatch]);

	if (error) throw error;
	return loading;
}
