import { createServer } from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { initAbleton } from './services/ableton/boot.service.js';
import { getIP } from './utils/getIP.js';
import { logger } from './utils/logger.js';

// ── Manejo de errores no capturados ──────────────────────────────────────────
// Evita que el proceso quede en un estado corrupto/indeterminado.
// Se registra el error como FATAL y se apaga el proceso para que PM2 lo reinicie de forma limpia.

process.on('uncaughtException', (err) => {
	logger.error('FATAL: uncaughtException', {
		error: err.message,
		stack: err.stack,
	});
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	logger.error('FATAL: unhandledRejection', {
		error: reason instanceof Error ? reason.message : String(reason),
		stack: reason instanceof Error ? reason.stack : undefined,
	});
	process.exit(1);
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
