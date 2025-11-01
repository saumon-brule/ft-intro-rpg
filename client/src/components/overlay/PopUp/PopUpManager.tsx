import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import PopUp from "./PopUp";
import { createPopUp } from "../../../store/slices/popUpsSlice";
import type { PopUpParams } from "../../../structures/PopUpParams";

// import "./PopUpManager.css";

export default function PopUpManager() {
	const popUps = useSelector((state: RootState) => state.popUps);
	const dispatch = useDispatch<AppDispatch>();

	((window as unknown) as { createPopUp: (popUpParams: PopUpParams) => void }).createPopUp = (popUpParams: PopUpParams) => dispatch(createPopUp(popUpParams));

	return popUps.map((popUpParams) => <PopUp key={popUpParams.id} params={popUpParams} />);
}
