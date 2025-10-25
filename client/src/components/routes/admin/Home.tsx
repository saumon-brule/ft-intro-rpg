import { useSelector } from "react-redux";
import { type RootState } from "../../../store";

export default function Home() {
	const user = useSelector((state: RootState) => state.user);

	return <div>
		<h1>{user.login}</h1>
		<img src={user.image}/>
	</div>;
}
