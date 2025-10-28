
import "./Login.css";

export default function Login() {
	return <div id="login-page">
		<h2>42 Campus RPG</h2>
		<a href="/api/auth" className="login-link">
			Login with <img src="https://www.universfreebox.com/wp-content/uploads/2019/07/logo_42.png" alt="42 logo" /> Intra
		</a>
	</div>;
}
