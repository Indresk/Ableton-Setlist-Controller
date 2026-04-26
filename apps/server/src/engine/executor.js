import { play, stop, setTempo } from '../services/ableton.service.js';

export default async function execute(action) {
	switch (action.type) {
		case 'PLAY_CLIP':
			await playClip(action.payload);
			break;

		case 'SET_TEMPO':
			await setTempo(action.payload.tempo);
			break;

		case 'STOP':
			await stop();
			break;
	}
}
