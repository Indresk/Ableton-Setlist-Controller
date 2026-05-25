import { EVENTS } from '../../../../packages/shared/events.js';
import { stop, setTempo } from '../services/ableton/ableton.service.js';
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
import { database } from '../config/db.config.js';
import { saveSetlist } from '../domain/db/setlist.repository.js';
import { logger } from '../utils/logger.js';


export const registerAbletonHandlers = (io, socket) => {
	// Enviar estado completo al cliente que acaba de conectarse
	socket.emit(EVENTS.SERVER.STATE_UPDATE, getState());

	// ── Comandos de transporte ────────────────────────────────────────────────

	socket.on(EVENTS.CLIENT.PLAY, async (songIndex, ack) => {
		logger.debug('CLIENT.PLAY recibido', { songIndex, clientId: socket.id });
		await playAt(songIndex);
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.CONTINUE, async (ack) => {
		logger.debug('CLIENT.CONTINUE recibido', { clientId: socket.id });
		continuePlaying();
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.STOP, async (ack) => {
		logger.debug('CLIENT.STOP recibido', { clientId: socket.id });
		await stop();
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.SET_TEMPO, async (tempo, ack) => {
		logger.debug('CLIENT.SET_TEMPO recibido', { tempo, clientId: socket.id });
		await setTempo(tempo);
		ack?.({ ok: true });
	});

	// ── Gestión del setlist / cue ─────────────────────────────────────────────

	socket.on(EVENTS.CLIENT.GET_CUE, async (ack) => {
		logger.info('CLIENT.GET_CUE: recargando cue points desde Ableton', { clientId: socket.id });
		const songsCue = await getSongsCue();
		patchAbletonState({ songsCue });
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.SET_CUE, async (songsCue, ack) => {
		logger.info('CLIENT.SET_CUE: guardando nuevo orden de canciones', {
			clientId: socket.id,
			songs: songsCue?.length,
		});

		// Aplicar el nuevo orden en memoria
		patchAbletonState({ songsCue });

		// Persistir en DB para sobrevivir reinicios
		try {
			saveSetlist(database, songsCue, 'last-saved');
			logger.info('Orden de canciones persistido en DB');
		} catch (err) {
			logger.error('Error al persistir orden en DB', { error: err.message });
			// No es un error fatal: el orden está en memoria aunque falle la persistencia
		}

		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.REFRESH, async (ack) => {
		logger.info('CLIENT.REFRESH: reenviando estado completo', { clientId: socket.id });
		patchAbletonState(getState());
		ack?.({ ok: true });
	});
};

export const registerAbletonBroadcaster = (io) => {
	abletonEventManager.on(ABLETON_EVENTS.STATE_CHANGE, (state) => {
		io.emit(EVENTS.SERVER.STATE_UPDATE, state);
	});
};
