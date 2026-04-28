import { getState, setState } from '../../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../../events/ableton.events.js';

export const publishState = () => {
	abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, getState());
};

export const patchAbletonState = (partial) => {
	setState(partial);
	publishState();
};
