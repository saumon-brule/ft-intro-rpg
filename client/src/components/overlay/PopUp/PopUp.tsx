import type { PopUpParams } from "../../../structures/PopUpParams";

import "./PopUp.css";

export default function PopUp({ params }: { params: PopUpParams }) {
	return <div className="pop-up">
		<div className="pop-up-header">
			<h2 className="pop-up-title">{params.title}</h2>
			<h3 className="pop-up-subtitle">{params.subtitle}</h3>
		</div>
		<p className="pop-up-subtitle">{params.content}</p>
	</div>;
}
