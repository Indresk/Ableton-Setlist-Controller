import { EVENTS } from '../../../../packages/shared/events.js';
import { play, stop, setTempo } from '../services/ableton/ableton.service.js';
import { getState } from '../state/ableton.state.js';
import {
	ABLETON_EVENTS,
	abletonEventManager,
} from '../events/ableton.events.js';
import { getSongsCue } from '../services/ableton/song-cue.service.js';
import { patchAbletonState } from '../services/ableton/state-publisher.service.js';
import {
	continuePlaying,
	playAt,
} from '../services/ableton/play-stop.service.js';

export const registerAbletonHandlers = (io, socket) => {
	// Enviar estado inicial
	socket.emit(EVENTS.SERVER.STATE_UPDATE, getState());

	// Eventos de acuerdo a lo que llegue del cliente
	socket.on(EVENTS.CLIENT.PLAY, async (songIndex, ack) => {
		await playAt(songIndex);
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.CONTINUE, async (ack) => {
		continuePlaying();
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

	socket.on(EVENTS.CLIENT.GET_CUE, async (ack) => {
		const songsCue = await getSongsCue();
		patchAbletonState({ songsCue });
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.SET_CUE, async (songsCue, ack) => {
		patchAbletonState({ songsCue });
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.REFRESH, async (ack) => {
		patchAbletonState(getState());
		ack?.({ ok: true });
	});
};

export const registerAbletonBroadcaster = (io) => {
	abletonEventManager.on(ABLETON_EVENTS.STATE_CHANGE, (state) => {
		io.emit(EVENTS.SERVER.STATE_UPDATE, state);
	});
};
