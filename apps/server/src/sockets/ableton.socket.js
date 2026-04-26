import { EVENTS } from '../../../../packages/shared/events.js';
import { play, stop, setTempo } from '../services/ableton.service.js';
import { getState } from '../state/ableton.state.js';

export const registerAbletonHandlers = (io, socket) => {
	// Enviar estado inicial
	socket.emit(EVENTS.SERVER.STATE_UPDATE, getState());

	socket.on(EVENTS.CLIENT.PLAY, async () => {
		await play();
		io.emit(EVENTS.SERVER.STATE_UPDATE, getState());
	});

	socket.on(EVENTS.CLIENT.STOP, async () => {
		await stop();
		io.emit(EVENTS.SERVER.STATE_UPDATE, getState());
	});

	socket.on(EVENTS.CLIENT.SET_TEMPO, async (tempo) => {
		await setTempo(tempo);
		io.emit(EVENTS.SERVER.STATE_UPDATE, getState());
	});
};
