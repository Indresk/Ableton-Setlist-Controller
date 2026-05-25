import { createServer } from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { initAbleton } from './services/ableton/boot.service.js';
import { getIP } from './utils/getIP.js';
import { logger } from './utils/logger.js';

// ── Manejo de errores no capturados ──────────────────────────────────────────
// Evita que el proceso caiga silenciosamente por errores inesperados.
// El proceso sigue en pie para servir la SPA y mantener los sockets activos.

process.on('uncaughtException', (err) => {
	logger.error('uncaughtException', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
	logger.error('unhandledRejection', {
		error: reason instanceof Error ? reason.message : String(reason),
		stack: reason instanceof Error ? reason.stack : undefined,
	});
});

// ── Arranque ─────────────────────────────────────────────────────────────────

const server = createServer(app);

initSockets(server);
initAbleton();

const PORT = process.env.PORT ?? 3000;

server.listen(PORT, () => {
	const ip = getIP();
	logger.info('Servidor iniciado', {
		local: `http://localhost:${PORT}`,
		network: `http://${ip}:${PORT}`,
		health: `http://${ip}:${PORT}/health`,
	});
});
