import { ableton } from './ableton.service.js';
import { timePollingPerBeat } from './playback-ticker.service.js';
import { playlistPlayer, playlistSeter } from './playlist.service.js';
import { patchAbletonState } from './state-publisher.service.js';

let isBound = false;

// Handlers de listener

const handleIsPlaying = (val) => {
	patchAbletonState({ isPlaying: val });
};

const handleTempo = (val) => {
	patchAbletonState({ tempo: val });
};

const handleArragenmentPosition = (time) => {
	timePollingPerBeat(time);
	playlistSeter(time);
	playlistPlayer(time);
};

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
