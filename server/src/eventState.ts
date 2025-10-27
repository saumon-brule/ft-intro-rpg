export type EventState = "idle" | "started" | "finished";

let currentState: EventState = "idle";

export function getEventState(): EventState {
  return currentState;
}

export function setEventState(s: EventState) {
  currentState = s;
}

export default { getEventState, setEventState };
