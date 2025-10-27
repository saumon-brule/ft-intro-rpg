import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch } from "../store";
import { login } from "../slices/userSlice";
import { usersMeSchema } from "../structures/schemas/usersMeSchema";
import { FetchError } from "../structures/FetchError";

export function useAuth() {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		fetch("/api/users/me")
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
				dispatch(login(usersMeSchema.parse(data)));
			})
			.catch((error) => setError(error))
			.finally(() => setLoading(false));
	}, [dispatch]);

	if (error) throw error;
	return loading;
}
