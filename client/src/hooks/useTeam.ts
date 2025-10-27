import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch, type RootState } from "../store";
import { FetchError } from "../structures/FetchError";
import { setTeam } from "../slices/teamSlice";
import { teamSchema } from "../structures/schemas/teamSchema";

export function useTeam() {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch<AppDispatch>();
	const teamId = useSelector((state: RootState) => state.user.teamId);

	useEffect(() => {
		if (teamId === null) {
			setLoading(false);
			return;
		}
		fetch(`/api/teams/${teamId}`)
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
				dispatch(setTeam(teamSchema.parse(data)));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
	}, [dispatch, teamId]);

	if (error) throw error;
	return loading;
}
