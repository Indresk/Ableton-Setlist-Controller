import { Ableton } from 'ableton-js';
import { logger } from '../../utils/logger.js';

// Pasamos nuestro logger a ableton-js para que sus mensajes internos
// sigan el mismo formato estructurado que el resto del servidor.
export const ableton = new Ableton({ logger });

export const play = async () => {
	await ableton.song.startPlaying();
};

export const stop = async () => {
	await ableton.song.stopPlaying();
};

export const setTempo = async (tempo) => await ableton.song.set('tempo', tempo);

export const getTempo = async () => await ableton.song.get('tempo');

export const jumpToTime = async (time) =>
	await ableton.song.set('current_song_time', time);

export const getRawCuePoints = async () => {
	return await ableton.song.get('cue_points');
};
