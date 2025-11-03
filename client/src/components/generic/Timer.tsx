import { useEffect, useRef, useState } from "react";

export default function Timer({ until }: { until: Date }) {
	const [remainingTime, setRemainingTime] = useState(Math.max(0, Math.round((until.getTime() - Date.now()) / 1000)));
	const intervalId = useRef<number | null>(null);

	useEffect(() => {
		if (intervalId.current) clearInterval(intervalId.current);
		intervalId.current = window.setInterval(() => {
			setRemainingTime(prev => {
				if (prev <= 1) {
					if (intervalId.current) clearInterval(intervalId.current);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => {
			if (intervalId.current) clearInterval(intervalId.current);
		};
	}, [until]);

	const minutes = Math.floor(remainingTime / 60);
	const seconds = remainingTime % 60;

	return <span>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>;
}
