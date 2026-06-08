import { getState } from '../../state/ableton.state.js';
import { continuePlaylist, jumpToTime, play } from './ableton.service.js';
import { logger } from '../../utils/logger.js';

let isExecuting = false;

export async function playAt(songIndex) {
	if (isExecuting) {
		logger.warn('playAt ignorado: ya hay una operación de playback en curso');
		return;
	}
	isExecuting = true;

	try {
		const [song, section = 0] = Array.isArray(songIndex)
			? songIndex
			: [songIndex, 0];

		const { songsCue } = getState();
		const targetSong = songsCue[song];

		if (!targetSong) {
			logger.error('playAt: índice de canción fuera de rango', {
				song,
				total: songsCue.length,
			});
			return;
		}

		const targetSection = targetSong.sections[section];
		if (!targetSection) {
			logger.error('playAt: índice de sección fuera de rango', {
				song,
				section,
				totalSections: targetSong.sections.length,
			});
			return;
		}

		const newTime = targetSection.time;
		logger.info('playAt', {
			song,
			section,
			songName: targetSong.name,
			time: newTime,
		});

		play();
		if (newTime != null) await jumpToTime(newTime);
	} finally {
		isExecuting = false;
	}
}

export async function continuePlaying() {
	if (isExecuting) {
		logger.warn(
			'continuePlaying ignorado: ya hay una operación de playback en curso',
		);
		return;
	}
	isExecuting = true;

	try {
		const { time } = getState();
		logger.info('continuePlaying', { time });

		await continuePlaylist();
	} finally {
		isExecuting = false;
	}
}
