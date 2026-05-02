import { ableton } from './ableton.service.js';
import {
	startTimePolling,
	stopTimePolling,
} from './playback-ticker.service.js';
import { playlistPlayer, playlistSeter } from './playlist.service.js';
import { patchAbletonState } from './state-publisher.service.js';

let isBound = false;
let arragementPosition = 0;

// Handlers de listener

const handleIsPlaying = (val) => {
	patchAbletonState({ isPlaying: val });

	if (val) {
		startTimePolling();
	} else {
		stopTimePolling();
	}
};

const handleTempo = (val) => {
	patchAbletonState({ tempo: val });
};

const handleArragenmentPosition = (time) => {
	playlistSeter(time);
	playlistPlayer(time);
	arragementPosition = time;
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
