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
import { dbService } from '../services/db/db.service.js';
import { logger } from '../utils/logger.js';

export const registerAbletonHandlers = (io, socket) => {
	// Sincronizar cliente / server

	socket.on(EVENTS.CLIENT.SYNC, async (lastEventId) => {
		logger.info('CLIENT.SYNC recibido', { clientId: socket.id, lastEventId });

		const currentState = getState();

		if (!lastEventId) {
			socket.emit(EVENTS.SERVER.FULL_STATE, currentState);
			return;
		}

		const events = await dbService.getEventsSince(lastEventId);

		if (events.length === 0) {
			socket.emit(EVENTS.SERVER.FULL_STATE, currentState);
		} else if (events.length > 50) {
			logger.info('CLIENT.SYNC: demasiados eventos, enviando FULL_STATE', {
				clientId: socket.id,
				missed: events.length,
			});
			socket.emit(EVENTS.SERVER.FULL_STATE, currentState);
		} else {
			logger.info('CLIENT.SYNC: haciendo replay de eventos', {
				clientId: socket.id,
				count: events.length,
			});
			for (const event of events) {
				socket.emit(EVENTS.SERVER.STATE_UPDATE, event.payload);
			}
		}
	});

	socket.on(EVENTS.CLIENT.REFRESH, async (ack) => {
		logger.info('CLIENT.REFRESH: reenviando estado completo', {
			clientId: socket.id,
		});
		patchAbletonState(getState());
		ack?.({ ok: true });
	});

	//  Eventos de nueva información

	socket.on(EVENTS.CLIENT.PLAY, async (songIndex, ack) => {
		if (typeof songIndex !== 'number' && !Array.isArray(songIndex)) {
			logger.warn('CLIENT.PLAY payload inválido', {
				songIndex,
				clientId: socket.id,
			});
			ack?.({
				ok: false,
				error: 'songIndex debe ser un número o un array [canción, sección]',
			});
			return;
		}
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
		if (typeof tempo !== 'number' || tempo < 20 || tempo > 999) {
			logger.warn('CLIENT.SET_TEMPO payload inválido', {
				tempo,
				clientId: socket.id,
			});
			ack?.({ ok: false, error: 'tempo debe ser un número entre 20 y 999' });
			return;
		}
		logger.debug('CLIENT.SET_TEMPO recibido', { tempo, clientId: socket.id });
		await setTempo(tempo);
		ack?.({ ok: true });
	});

	// Eventos de setlist

	socket.on(EVENTS.CLIENT.GET_CUE, async (ack) => {
		logger.info('CLIENT.GET_CUE: recargando cue points desde Ableton', {
			clientId: socket.id,
		});
		const songsCue = await getSongsCue();
		patchAbletonState({ songsCue });
		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.SET_CUE, async (songsCue, ack) => {
		if (!Array.isArray(songsCue)) {
			logger.warn('CLIENT.SET_CUE payload inválido', { clientId: socket.id });
			ack?.({ ok: false, error: 'songsCue debe ser un array' });
			return;
		}

		logger.info('CLIENT.SET_CUE: guardando nuevo orden de canciones', {
			clientId: socket.id,
			songs: songsCue.length,
		});

		patchAbletonState({ songsCue });

		try {
			await dbService.saveSetlist(songsCue, 'last-saved');
			logger.info('Orden de canciones persistido en DB');
		} catch (err) {
			logger.error('Error al persistir orden en DB', { error: err.message });
		}

		ack?.({ ok: true });
	});

	socket.on(EVENTS.CLIENT.FETCH_SETLISTS, async (ack) => {
		if (typeof ack !== 'function') return;
		try {
			const setlists = await dbService.listSetlists();
			ack({ ok: true, data: setlists });
		} catch (err) {
			logger.error('Error al listar setlists', { error: err.message });
			ack({ ok: false, error: 'Error al listar setlists' });
		}
	});

	socket.on(EVENTS.CLIENT.FETCH_SETLIST_BY_ID, async (id, ack) => {
		if (typeof ack !== 'function') return;
		if (!id || typeof id !== 'number') {
			ack({ ok: false, error: 'id debe ser un número' });
			return;
		}
		try {
			const songs = await dbService.loadSetlistById(id);
			if (!songs) {
				ack({ ok: false, error: `Setlist con id ${id} no encontrado` });
				return;
			}
			ack({ ok: true, data: songs });
		} catch (err) {
			logger.error('Error al cargar setlist por ID', {
				error: err.message,
				id,
			});
			ack({ ok: false, error: 'Error al cargar setlist' });
		}
	});

	socket.on(EVENTS.CLIENT.SAVE_SETLIST, async (payload, ack) => {
		if (!payload || !Array.isArray(payload.songs)) {
			logger.warn('CLIENT.SAVE_SETLIST payload inválido', {
				clientId: socket.id,
			});
			ack?.({ ok: false, error: 'payload.songs debe ser un array' });
			return;
		}
		const { songs, name } = payload;
		try {
			const id = await dbService.saveSetlist(songs, name);
			logger.info('Setlist guardado desde cliente', {
				name: name || '(auto)',
				songs: songs.length,
				id,
				clientId: socket.id,
			});
			ack?.({ ok: true, data: { id } });
		} catch (err) {
			logger.error('Error al guardar setlist', { error: err.message });
			ack?.({ ok: false, error: 'Error al guardar setlist' });
		}
	});
};

// Eventos locales de ableton

export const registerAbletonBroadcaster = (io) => {
	abletonEventManager.on(ABLETON_EVENTS.STATE_CHANGE, (state) => {
		io.emit(EVENTS.SERVER.STATE_UPDATE, state);
	});

	abletonEventManager.on(ABLETON_EVENTS.STATUS_CHANGE, (isConnected) => {
		io.emit(EVENTS.SERVER.ABLETON_STATUS, { connected: isConnected });
	});
};
