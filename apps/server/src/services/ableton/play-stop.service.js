import { getState } from '../../state/ableton.state.js';
import { jumpToTime, play } from './ableton.service.js';

export async function playAt(songIndex) {
	const [song, section = 0] = Array.isArray(songIndex)
		? songIndex
		: [songIndex, 0];
	const { songsCue } = getState();
	const newTime = songsCue[song].sections[section].time;
	play();
	if (newTime) await jumpToTime(newTime);
}

export async function continuePlaying() {
	const { time } = getState();
	play();
	await jumpToTime(time);
}
