import { setState } from '../../state/ableton.state.js';
import { ableton, getTempo } from './ableton.service.js';
import { bindAbletonListeners } from './listeners.service.js';
import { getSongsCue } from './song-cue.service.js';
import { publishState } from './state-publisher.service.js';
import { dbService } from '../db/db.service.js';

function reconcileSetlistWithAbleton(savedSongs, abletonSongs) {
	const abletonMap = new Map(abletonSongs.map((s) => [s.name, s]));
	const savedNames = new Set(savedSongs.map((s) => s.song_name));

	const reconciled = savedSongs
		.filter((saved) => abletonMap.has(saved.song_name))
		.map((saved) => abletonMap.get(saved.song_name));

	for (const abletonSong of abletonSongs) {
		if (!savedNames.has(abletonSong.name)) {
			reconciled.push(abletonSong);
		}
	}

	return reconciled;
}
import { logger } from '../../utils/logger.js';
import { setServerState } from '../../state/server.state.js';
import {
	abletonEventManager,
	ABLETON_EVENTS,
} from '../../events/ableton.events.js';

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

	let songsCue = abletonSongsCue;
	try {
		const savedSetlist = await dbService.loadActiveSetlist();
		if (savedSetlist) {
			songsCue = reconcileSetlistWithAbleton(savedSetlist, abletonSongsCue);
			const added =
				songsCue.length -
				savedSetlist.filter((s) =>
					abletonSongsCue.some((a) => a.name === s.song_name),
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

export const initAbleton = async () => {
	let retryCount = 0;
	let backoffMs = 2000;
	const MAX_BACKOFF_MS = 30000;

	while (true) {
		try {
			await attemptAbletonConnection();
			break;
		} catch (err) {
			retryCount++;
			setServerState({
				abletonConnectionState:
					retryCount === 1 ? 'DISCONNECTED' : 'RECONNECTING',
			});
			abletonEventManager.emit(ABLETON_EVENTS.STATUS_CHANGE, false);

			logger.error('Error al inicializar Ableton (reintentando...)', {
				error: err.message,
				attempt: retryCount,
				nextRetryInMs: backoffMs,
			});

			await new Promise((resolve) => setTimeout(resolve, backoffMs));

			backoffMs = Math.min(backoffMs * 1.5, MAX_BACKOFF_MS);
		}
	}
};
