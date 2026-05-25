import express from 'express';
import { getState } from '../state/ableton.state.js';
import { getServerState } from '../state/server.state.js';

const healthRoute = express.Router();

/**
 * GET /health
 *
 * Retorna el estado operativo actual del servidor.
 * Útil para diagnóstico rápido, monitoreo en LAN y verificación post-arranque.
 *
 * Respuesta:
 *  - status: 'ok' | 'degraded'  (degraded si Ableton no está conectado)
 *  - uptime: segundos desde que arrancó el proceso
 *  - ableton.connected: si hay conexión activa con Ableton Live
 *  - ableton.isPlaying: estado de reproducción según el estado del servidor
 *  - ableton.tempo: tempo actual en BPM
 *  - ableton.songs: cantidad de canciones en el setlist activo
 *  - clients: clientes socket conectados en este momento
 *  - timestamp: Unix timestamp en ms del momento de la consulta
 */
healthRoute.get('/', (req, res) => {
	const abletonState = getState();
	const serverState = getServerState();

	const status = serverState.abletonConnected ? 'ok' : 'degraded';

	res.status(status === 'ok' ? 200 : 503).json({
		status,
		uptime: Math.floor(process.uptime()),
		ableton: {
			connected: serverState.abletonConnected,
			isPlaying: abletonState.isPlaying,
			tempo: abletonState.tempo,
			songs: abletonState.songsCue?.length ?? 0,
		},
		clients: serverState.connectedClients,
		startedAt: serverState.startedAt,
		timestamp: Date.now(),
	});
});

export default healthRoute;
