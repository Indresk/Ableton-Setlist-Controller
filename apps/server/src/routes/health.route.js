import express from 'express';
import { getState } from '../state/ableton.state.js';
import { getServerState } from '../state/server.state.js';
import { healthRender } from './health.render.js';

const healthRoute = express.Router();

healthRoute.get('/', (req, res) => {
	const abletonState = getState();
	const serverState = getServerState();

	const status = serverState.abletonConnected ? 'ok' : 'degraded';

	res.status(status === 'ok' ? 200 : 503).send(
		healthRender({
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
		}),
	);
});

export default healthRoute;
