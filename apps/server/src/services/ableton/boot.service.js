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

/**
 * Arranca la conexión con Ableton y carga el estado inicial.
 *
 * Orden de operaciones:
 *  1. Conectar con Ableton Live via ableton-js.
 *  2. Registrar listeners de cambios en tiempo real.
 *  3. Leer tempo, is_playing y cue points actuales de Ableton.
 *  4. Intentar cargar el orden de canciones guardado en DB.
 *  5. Si hay orden guardado: reconciliar con Ableton (fuente de verdad).
 *  6. Si no hay orden guardado: usar el orden de Ableton directamente.
 *  7. Publicar el estado inicial a todos los clientes conectados.
 */
export const initAbleton = async () => {
	logger.info('Iniciando conexión con Ableton...');

	try {
		await ableton.start();
		logger.info('Conexión con Ableton establecida');
		setServerState({ abletonConnected: true });

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
	} catch (err) {
		setServerState({ abletonConnected: false });
		logger.error('Error al inicializar Ableton', {
			error: err.message,
			stack: err.stack,
		});
		// No se hace process.exit - el servidor sigue en pie para servir la SPA
		// y para que el cliente muestre el estado de "Ableton desconectado".
		// Los listeners no quedan registrados, así que no habrá actualizaciones de estado.
	}
};
