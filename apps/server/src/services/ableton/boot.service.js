import { setState } from '../../state/ableton.state.js';
import { ableton, getTempo } from './ableton.service.js';
import { bindAbletonListeners } from './listeners.service.js';
import { getSongsCue } from './song-cue.service.js';
import { publishState } from './state-publisher.service.js';
import { database } from '../../config/db.config.js';
import {
	loadActiveSetlist,
	reconcileSetlistWithAbleton,
} from '../../domain/db/setlist.repository.js';
import { logger } from '../../utils/logger.js';
import { setServerState } from '../../state/server.state.js';
import { abletonEventManager, ABLETON_EVENTS } from '../../events/ableton.events.js';

/**
 * Intenta conectar con Ableton y carga el estado inicial.
 */
const attemptAbletonConnection = async () => {
	logger.info('Intentando conexión con Ableton...');
	setServerState({ abletonConnectionState: 'CONNECTING' });

	await ableton.start();
	logger.info('Conexión con Ableton establecida');
	setServerState({ abletonConnectionState: 'CONNECTED' });
	abletonEventManager.emit(ABLETON_EVENTS.STATUS_CHANGE, true);

	bindAbletonListeners();

	const [tempo, isPlaying, abletonSongsCue] = await Promise.all([
		getTempo(),
		ableton.song.get('is_playing'),
		getSongsCue(),
	]);

	logger.info('Estado inicial leído de Ableton', {
		tempo,
		isPlaying,
		songs: abletonSongsCue.length,
	});

	// Intentar restaurar el orden de canciones guardado por el usuario
	let songsCue = abletonSongsCue;
	try {
		const savedSetlist = loadActiveSetlist(database);
		if (savedSetlist) {
			songsCue = reconcileSetlistWithAbleton(savedSetlist, abletonSongsCue);
			const added =
				songsCue.length -
				savedSetlist.filter((s) =>
					abletonSongsCue.some((a) => String(a.id) === s.ableton_song_id),
				).length;
			const removed = savedSetlist.length - (songsCue.length - added);
			logger.info('Setlist cargado y reconciliado con Ableton', {
				saved: savedSetlist.length,
				ableton: abletonSongsCue.length,
				result: songsCue.length,
				added,
				removed,
			});
		} else {
			logger.info('Sin setlist guardado - usando orden de Ableton');
		}
	} catch (dbErr) {
		logger.warn('Error al cargar setlist de DB - usando orden de Ableton', {
			error: dbErr.message,
		});
		songsCue = abletonSongsCue;
	}

	setState({ tempo, isPlaying, songsCue });
	publishState();

	logger.info('Estado inicial publicado a clientes');
};

/**
 * Arranca la conexión con Ableton.
 * Si falla, entra en un loop de reconexión con backoff incremental.
 */
export const initAbleton = async () => {
	let retryCount = 0;
	let backoffMs = 2000;
	const MAX_BACKOFF_MS = 30000; // Máximo 30 segundos entre intentos

	while (true) {
		try {
			await attemptAbletonConnection();
			// Si conecta exitosamente, rompemos el loop
			break;
		} catch (err) {
			retryCount++;
			setServerState({ abletonConnectionState: retryCount === 1 ? 'DISCONNECTED' : 'RECONNECTING' });
			abletonEventManager.emit(ABLETON_EVENTS.STATUS_CHANGE, false);
			
			logger.error('Error al inicializar Ableton (reintentando...)', {
				error: err.message,
				attempt: retryCount,
				nextRetryInMs: backoffMs,
			});

			// Esperar antes del siguiente intento
			await new Promise(resolve => setTimeout(resolve, backoffMs));
			
			// Incrementar backoff
			backoffMs = Math.min(backoffMs * 1.5, MAX_BACKOFF_MS);
		}
	}
};
