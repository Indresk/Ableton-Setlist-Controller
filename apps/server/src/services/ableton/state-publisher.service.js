import { getState, setState } from '../../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../../events/ableton.events.js';

export const publishState = (keyToSend) => {
	const newState = getState();
	if (!keyToSend) {
		abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, newState);
		return;
	}

	const objectFiltered = {};

	for (const key of keyToSend) {
		const value = newState[key];
		objectFiltered[key] = value;
	}

	abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, objectFiltered);
};

export const patchAbletonState = (partial) => {
	setState(partial);
	publishState(Object.keys(partial));
};
