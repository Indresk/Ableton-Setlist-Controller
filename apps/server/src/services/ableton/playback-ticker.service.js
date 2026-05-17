import { getState } from '../../state/ableton.state.js';
import { patchAbletonState } from './state-publisher.service.js';

export const timePollingPerBeat = (arrangementTime) => {
	const { time } = getState();
	const fixedArrangementTime = Math.floor(arrangementTime);
	if (time != fixedArrangementTime) {
		patchAbletonState({ time: fixedArrangementTime });
	}
};
