import { resolvePlaybackContext } from '../../domain/ableton/song-position.resolver.js';
import { getState, setState } from '../../state/ableton.state.js';
import { jumpToTime, stop } from './ableton.service.js';
import { patchAbletonState } from './state-publisher.service.js';

export function playlistSeter(time) {
	const { songsCue, currentSong, currentSection } = getState();
	const songState = resolvePlaybackContext(songsCue, time);
	if (currentSong != songState.currentSongIndex) {
		patchAbletonState({ currentSong: songState.currentSongIndex });
	}
	if (currentSection != songState.currentSectionIndex) {
		patchAbletonState({ currentSection: songState.currentSectionIndex });
	}
}

export async function playlistPlayer(time) {
	const { songsCue, currentSong } = getState();
	const currentSongInfo = songsCue?.[currentSong];
	const nextSongInfo = songsCue?.[currentSong + 1];

	const endTime = currentSongInfo?.end;
	const nextSongTime = nextSongInfo?.start;

	const timeFixed = Math.round(time);

	if (!nextSongInfo || nextSongTime == null) {
		if (timeFixed === endTime) await stop();
		return;
	}

	if (timeFixed === endTime) await jumpToTime(nextSongTime);
}
