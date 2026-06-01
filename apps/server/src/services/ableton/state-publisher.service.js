import { getState, setState } from '../../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../../events/ableton.events.js';
import { EVENTS } from '../../../../../packages/shared/events.js';
import { database } from '../../config/db.config.js';
import { saveEvent, getMaxEventId } from '../../domain/db/event-log.repository.js';
import { logger } from '../../utils/logger.js';

// Inicializar el ID desde la DB en el arranque
let currentAppEventId = getMaxEventId(database);

export const publishState = (keyToSend) => {
	const newState = getState();
	let payload = {};

	if (!keyToSend) {
		payload = newState;
	} else {
		for (const key of keyToSend) {
			payload[key] = newState[key];
		}
	}

	try {
		// Incremento síncrono ultra rápido en memoria
		currentAppEventId += 1;
		const eventId = currentAppEventId;

		// 1. Inyectamos y emitimos de inmediato al cliente (camino crítico libre de I/O)
		const payloadWithId = { ...payload, lastEventId: eventId };
		abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, payloadWithId);

		// 2. Persistimos de forma diferida fuera del tick actual
		setImmediate(() => {
			saveEvent(database, eventId, EVENTS.SERVER.STATE_UPDATE, payload);
		});
	} catch (error) {
		logger.error('Error al publicar estado', { error: error.message });
	}
};

export const patchAbletonState = (partial) => {
	setState(partial);
	publishState(Object.keys(partial));
};
