import { Component, type ReactNode } from "react";
import { FetchError } from "../../structures/FetchError";

interface Props {
	children: ReactNode,
	fallback: ReactNode
};

interface State {
	hasError: boolean
};

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		if (error instanceof FetchError) {
			console.error(error.status, "-", error.message, errorInfo);
		} else {
			console.error(error.message, errorInfo);
		}
	}

	render() {
		if (this.state.hasError)
			return this.props.fallback;
		else
			return this.props.children;
	}
}
