import { ableton } from './ableton.service.js';
import {
	startTimePolling,
	stopTimePolling,
} from './playback-ticker.service.js';
import { patchAbletonState } from './state-publisher.service.js';

let isBound = false;
let lastPublishedAt = 0;
let arragementPosition = 0;
let needsFreshArrangementPosition = false;
// let isPlaying = false;

// Handlers de listener

const handleIsPlaying = (val) => {
	// isPlaying = val;
	patchAbletonState({ isPlaying: val });

	if (val) {
		needsFreshArrangementPosition = true;
		startTimePolling();
	} else {
		stopTimePolling();
	}
};

const handleTempo = (val) => {
	patchAbletonState({ tempo: val });
};

const handleArragenmentPosition = (time) => {
	const now = Date.now();
	if (needsFreshArrangementPosition) {
		arragementPosition = time;
		needsFreshArrangementPosition = false;
		lastPublishedAt = now;
		return;
	}

	if (now - lastPublishedAt >= 250) {
		lastPublishedAt = now;
		arragementPosition = time;
	}
};

export const getArregementPosition = () => arragementPosition;

// Controladores de Listener

export const bindAbletonListeners = () => {
	if (isBound) return;

	ableton.song.addListener('is_playing', handleIsPlaying);
	ableton.song.addListener('tempo', handleTempo);
	ableton.song.addListener('current_song_time', handleArragenmentPosition);

	isBound = true;
};

export const unbindAbletonListeners = () => {
	if (!isBound) return;

	ableton.song.removeListener?.('is_playing', handleIsPlaying);
	ableton.song.removeListener?.('tempo', handleTempo);
	ableton.song.removeListener?.('current_song_time', handleArragenmentPosition);

	isBound = false;
};
