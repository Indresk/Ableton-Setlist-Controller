import { resolvePlaybackContext } from '../../domain/ableton/song-position.resolver.js';
import { getState, setState } from '../../state/ableton.state.js';
import { jumpToTime, stop } from './ableton.service.js';
import { patchAbletonState } from './state-publisher.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Guard para evitar que playlistPlayer dispare múltiples jumpToTime o stop
 * en ticks consecutivos que redondeen al mismo beat entero.
 *
 * `current_song_time` de Ableton puede llegar varias veces con valores
 * distintos que todos redondean al mismo entero (ej: 63.97, 64.01, 64.03).
 * Sin este guard, cada uno de esos ticks dispararía un jumpToTime o stop
 * adicional, causando saltos erráticos en el transporte.
 */
let isTransitioning = false;
const TRANSITION_COOLDOWN_MS = 1500;
let lastTransitionAt = 0;

// ─── Detección de canción/sección actual ─────────────────────────────────────

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

// ─── Auto-avance de playlist ─────────────────────────────────────────────────

export async function playlistPlayer(time) {
	// Cooldown: no procesar durante el período post-transición
	const now = Date.now();
	if (isTransitioning || now - lastTransitionAt < TRANSITION_COOLDOWN_MS)
		return;

	const { songsCue, currentSong } = getState();
	const currentSongInfo = songsCue?.[currentSong];
	const nextSongInfo = songsCue?.[currentSong + 1];

	const endTime = currentSongInfo?.end;
	const nextSongTime = nextSongInfo?.start;

	const timeFixed = Math.floor(time);

	// Última canción de la playlist: parar al llegar al final
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

	// Hay siguiente canción: saltar a ella al llegar al final de la actual
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
