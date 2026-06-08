import { resolvePlaybackContext } from '../../domain/ableton/song-position.resolver.js';
import { getState, setState } from '../../state/ableton.state.js';
import { jumpToTime, stop } from './ableton.service.js';
import { patchAbletonState } from './state-publisher.service.js';
import { logger } from '../../utils/logger.js';

let isTransitioning = false;
const TRANSITION_COOLDOWN_MS = 1500;
let lastTransitionAt = 0;

export function playlistSeter(time) {
	const { songsCue, currentSong, currentSection } = getState();
	const songState = resolvePlaybackContext(songsCue, time);

	if (currentSong !== songState.currentSongIndex) {
		patchAbletonState({ currentSong: songState.currentSongIndex });
	}
	if (currentSection !== songState.currentSectionIndex) {
		patchAbletonState({ currentSection: songState.currentSectionIndex });
	}
}

export async function playlistPlayer(time) {
	const now = Date.now();
	if (isTransitioning || now - lastTransitionAt < TRANSITION_COOLDOWN_MS)
		return;

	const { songsCue, currentSong } = getState();
	const currentSongInfo = songsCue?.[currentSong];
	const nextSongInfo = songsCue?.[currentSong + 1];

	const endTime = currentSongInfo?.end;
	const nextSongTime = nextSongInfo?.start;

	const timeFixed = Math.floor(time + 0.1);

	if (!nextSongInfo || nextSongTime == null) {
		if (timeFixed === endTime) {
			isTransitioning = true;
			lastTransitionAt = now;
			logger.info('playlistPlayer: fin de playlist, deteniendo', { endTime });
			try {
				await stop();
			} finally {
				isTransitioning = false;
			}
		}
		return;
	}

	if (timeFixed === endTime) {
		isTransitioning = true;
		lastTransitionAt = now;
		logger.info('playlistPlayer: transición de canción', {
			from: currentSongInfo?.name,
			to: nextSongInfo?.name,
			fromEnd: endTime,
			toStart: nextSongTime,
		});
		try {
			await jumpToTime(nextSongTime);
		} finally {
			isTransitioning = false;
		}
	}
}
