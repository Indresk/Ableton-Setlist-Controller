import { setState } from '../../state/ableton.state.js';
import { getArregementPosition } from './listeners.service.js';
import { playlistSeter } from './playlist.service.js';
import { patchAbletonState } from './state-publisher.service.js';
let timePollingId = null;

export const startTimePolling = () => {
	if (timePollingId) return;

	timePollingId = setInterval(() => {
		let latestTime = getArregementPosition();

		setState({
			time: latestTime,
		});
	}, 500);
};

export const stopTimePolling = () => {
	if (!timePollingId) return;

	clearInterval(timePollingId);
	timePollingId = null;
};
