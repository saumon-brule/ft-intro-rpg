import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Error404 from "./Error404";

export default function ErrorPage() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		if (error.status === 404)
			return <Error404 />;
		return <div>
			<h1>Oops!</h1>
			<p>
				{error.status} {error.statusText}
			</p>
			{error.data?.message && <p>{error.data.message}</p>}
		</div>;
	}

	if (error instanceof Error) {
		return (
			<div>
				<h1>Erreur inattendue</h1>
				<p>{error.message}</p>
			</div>
		);
	}

	return <h1>Une erreur inconnue est survenue.</h1>;
}
