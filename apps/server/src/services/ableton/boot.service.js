import { setState } from '../../state/ableton.state.js';
import { ableton, getTempo } from './ableton.service.js';
import { bindAbletonListeners } from './listeners.service.js';
import { getSongsCue } from './song-cue.service.js';
import { publishState } from './state-publisher.service.js';

export const initAbleton = async () => {
	await ableton.start();
	bindAbletonListeners();

	const [tempo, isPlaying, songsCue] = await Promise.all([
		getTempo(),
		ableton.song.get('is_playing'),
		getSongsCue(),
	]);
	setState({ tempo, isPlaying, songsCue });
	publishState();
};
