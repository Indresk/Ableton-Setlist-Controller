import { getArregementPosition } from './listeners.service.js';
import { patchAbletonState } from './state-publisher.service.js';
let timePollingId = null;

export const startTimePolling = () => {
	if (timePollingId) return;

	timePollingId = setInterval(() => {
		let latestTime = getArregementPosition();

		// const playbackContext = resolvePlaybackContext(latestTime);

		patchAbletonState({
			time: latestTime,
			//   ...playbackContext,
		});
	}, 1000);
};

export const stopTimePolling = () => {
	if (!timePollingId) return;

	clearInterval(timePollingId);
	timePollingId = null;
};
