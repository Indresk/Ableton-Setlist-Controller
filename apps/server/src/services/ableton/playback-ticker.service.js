import { getState } from '../../state/ableton.state.js';
import { patchAbletonState } from './state-publisher.service.js';
import { logger } from '../../utils/logger.js';

export const timePollingPerBeat = (arrangementTime) => {
	const { time } = getState();
	const fixedArrangementTime = Math.floor(arrangementTime);
	if (time !== fixedArrangementTime) {
		logger.debug('Beat tick', {
			prevBeat: time,
			newBeat: fixedArrangementTime,
		});
		patchAbletonState({ time: fixedArrangementTime });
	}
};
