import { getState } from '../../state/ableton.state.js';
import { jumpToTime, play } from './ableton.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Guard contra ejecuciones concurrentes de comandos de playback.
 * Ableton no es transaccional — si llegan dos comandos play+jump simultáneos
 * pueden interferir entre sí y producir saltos al tiempo incorrecto.
 */
let isExecuting = false;

/**
 * Salta a la canción (y sección opcional) indicada y arranca la reproducción.
 *
 * El doble play() es intencional: Ableton requiere dos llamadas consecutivas
 * para arrancar correctamente desde un cue point cuando el transporte estaba detenido.
 * Si se llama una sola vez, en algunos escenarios Ableton empieza desde 0 en lugar
 * del punto de salto. Es un workaround documentado del comportamiento de ableton-js.
 *
 * @param {number | [number, number]} songIndex — índice de canción, o [canción, sección]
 */
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

		// Doble play() intencional — ver comentario arriba.
		play();
		// play();
		if (newTime != null) await jumpToTime(newTime);
	} finally {
		isExecuting = false;
	}
}

/**
 * Reanuda la reproducción desde la posición actual del transporte del servidor.
 *
 * El doble play() es intencional por el mismo motivo que en playAt.
 */
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

		// Doble play() intencional — ver comentario en playAt.
		play();
		// play();
		await jumpToTime(time);
	} finally {
		isExecuting = false;
	}
}
