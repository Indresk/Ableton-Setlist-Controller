import { createServer } from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { initAbleton } from './services/ableton/boot.service.js';
import { initStatePublisher } from './services/ableton/state-publisher.service.js';
import { getIP } from './utils/getIP.js';
import { logger } from './utils/logger.js';

// Manejo de errores

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

// Inicialización base

const server = createServer(app);
initSockets(server);

const PORT = process.env.PORT ?? 3000;

server.listen(PORT, async () => {
	const ip = getIP();
	logger.info('Servidor iniciado', {
		local: `http://localhost:${PORT}`,
		network: `http://${ip}:${PORT}`,
		health: `http://${ip}:${PORT}/health`,
	});

	await initStatePublisher();

	initAbleton();
});
