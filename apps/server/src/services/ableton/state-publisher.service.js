import { getState, setState } from '../../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../../events/ableton.events.js';
import { EVENTS } from '../../../../../packages/shared/events.js';
import { dbService } from '../db/db.service.js';
import { logger } from '../../utils/logger.js';

let currentAppEventId = 0;

export const initStatePublisher = async () => {
	currentAppEventId = await dbService.getMaxEventId();
	logger.info('State Publisher inicializado', { eventId: currentAppEventId });
};

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
		currentAppEventId += 1;
		const eventId = currentAppEventId;

		const payloadWithId = { ...payload, lastEventId: eventId };
		abletonEventManager.emit(ABLETON_EVENTS.STATE_CHANGE, payloadWithId);

		dbService
			.saveEvent(eventId, EVENTS.SERVER.STATE_UPDATE, payload)
			.catch((err) => {
				logger.error('Error al guardar evento en DB worker', {
					error: err.message,
				});
			});
	} catch (error) {
		logger.error('Error al publicar estado', { error: error.message });
	}
};

export const patchAbletonState = (partial) => {
	setState(partial);
	publishState(Object.keys(partial));
};
