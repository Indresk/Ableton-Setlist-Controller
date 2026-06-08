import { ableton } from './ableton.service.js';
import { timePollingPerBeat } from './playback-ticker.service.js';
import { playlistPlayer, playlistSeter } from './playlist.service.js';
import { patchAbletonState } from './state-publisher.service.js';
import { logger } from '../../utils/logger.js';

let isBound = false;

const handleIsPlaying = (val) => {
	logger.info('Ableton: is_playing cambió', { isPlaying: val });
	patchAbletonState({ isPlaying: val });
};

const handleTempo = (val) => {
	logger.debug('Ableton: tempo cambió', { tempo: val });
	patchAbletonState({ tempo: val });
};

const handleArrangementPosition = (time) => {
	timePollingPerBeat(time);
	playlistSeter(time);
	playlistPlayer(time);
};

export const bindAbletonListeners = () => {
	if (isBound) return;

	ableton.song.addListener('is_playing', handleIsPlaying);
	ableton.song.addListener('tempo', handleTempo);
	ableton.song.addListener('current_song_time', handleArrangementPosition);

	isBound = true;
	logger.info('Listeners de Ableton registrados');
};

export const unbindAbletonListeners = () => {
	if (!isBound) return;

	ableton.song.removeListener?.('is_playing', handleIsPlaying);
	ableton.song.removeListener?.('tempo', handleTempo);
	ableton.song.removeListener?.('current_song_time', handleArrangementPosition);

	isBound = false;
	logger.info('Listeners de Ableton eliminados');
};
