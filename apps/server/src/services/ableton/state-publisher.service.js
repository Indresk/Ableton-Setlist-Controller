import { getState, setState } from '../../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../../events/ableton.events.js';
import { EVENTS } from '../../../../../packages/shared/events.js';
import { database } from '../../config/db.config.js';
import { saveEvent } from '../../domain/db/event-log.repository.js';
import { logger } from '../../utils/logger.js';

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
		// Guardamos el evento y obtenemos el eventId monotónico
		const eventId = saveEvent(database, EVENTS.SERVER.STATE_UPDATE, payload);

		// Inyectamos el eventId al payload para que los clientes lo reciban
		const payloadWithId = { ...payload, lastEventId: eventId };

		abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, payloadWithId);
	} catch (error) {
		logger.error('Error al publicar estado', { error: error.message });
	}
};

export const patchAbletonState = (partial) => {
	setState(partial);
	publishState(Object.keys(partial));
};
