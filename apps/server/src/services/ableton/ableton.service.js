import { Ableton } from 'ableton-js';

export const ableton = new Ableton({ logger: console });

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
