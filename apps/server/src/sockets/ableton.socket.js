import { EVENTS } from '../../../../packages/shared/events.js';
import { play, stop, setTempo } from '../services/ableton/ableton.service.js';
import { getState } from '../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../events/ableton.events.js';

export const registerAbletonHandlers = (io, socket) => {
	// Enviar estado inicial
	socket.emit(EVENTS.SERVER.STATE_UPDATE, getState());

	// Eventos de acuerdo a lo que llegue del cliente
	socket.on(EVENTS.CLIENT.PLAY, async (ack) => {
		await play();
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.STOP, async (ack) => {
		await stop();
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.SET_TEMPO, async (tempo, ack) => {
		await setTempo(tempo);
		ack?.({ ok: true });
	});
};

export const registerAbletonBroadcaster = (io) => {
	abletonEventManager.on(ABLETON_EVENTS.STATE_CHANGE, (state) => {
		io.emit(EVENTS.SERVER.STATE_UPDATE, state);
	});
};
