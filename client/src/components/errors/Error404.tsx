import { Link } from "react-router-dom";

export default function Error404() {
	return <div id="error-404">
		<div id="error-404-container">
			<h1>
				Erreur 404 :
			</h1>
			<p className="detail">
				La page que vuos cherchez n'existe pas ...
			</p>
			<Link to="/" className="button">Retourner en lieu sûr</Link>
		</div>
	</div>;
}
