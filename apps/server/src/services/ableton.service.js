import { Ableton } from 'ableton-js';
import { setState } from '../state/ableton.state.js';

const ableton = new Ableton({ logger: console });

export const initAbleton = async () => {
	await ableton.start();
	const cuePoints = await ableton.song.get('cue_points');
	console.log(cuePoints);

	// Listeners
	ableton.song.addListener('is_playing', (val) => {
		setState({ isPlaying: val });
	});

	ableton.song.addListener('tempo', (val) => {
		setState({ tempo: val });
	});
};

export const play = async () => {
	await ableton.song.startPlaying();
};

export const stop = async () => {
	await ableton.song.stopPlaying();
};

export const setTempo = async (tempo) => {
	await ableton.song.set('tempo', tempo);
	setState({ tempo });
};

export const getTempo = async () => {
	const tempo = await ableton.song.get('tempo');
};
