import { getState } from '../../state/ableton.state.js';
import { patchAbletonState } from './state-publisher.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Filtra los ticks de `current_song_time` de Ableton y solo publica
 * una actualización de `time` cuando el beat entero (Math.floor) cambia.
 * Esto evita inundar el bus de eventos con cada micro-variación de tiempo.
 */
export const timePollingPerBeat = (arrangementTime) => {
	const { time } = getState();
	const fixedArrangementTime = Math.floor(arrangementTime);
	if (time !== fixedArrangementTime) {
		logger.debug('Beat tick', { prevBeat: time, newBeat: fixedArrangementTime });
		patchAbletonState({ time: fixedArrangementTime });
	}
};

