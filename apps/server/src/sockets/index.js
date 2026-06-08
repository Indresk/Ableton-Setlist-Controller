import { Server } from 'socket.io';
import {
	registerAbletonBroadcaster,
	registerAbletonHandlers,
} from './ableton.socket.js';
import { setServerState } from '../state/server.state.js';
import { logger } from '../utils/logger.js';

export const initSockets = (server) => {
	const io = new Server(server, {
		cors: { origin: '*' },
	});

	registerAbletonBroadcaster(io);

	io.on('connection', (socket) => {
		const clientCount = io.engine.clientsCount;
		setServerState({ connectedClients: clientCount });
		logger.info('Cliente conectado', {
			clientId: socket.id,
			totalClients: clientCount,
			ip: socket.handshake.address,
		});

		registerAbletonHandlers(io, socket);

		socket.on('disconnect', (reason) => {
			const clientCountAfter = io.engine.clientsCount;
			setServerState({ connectedClients: clientCountAfter });
			logger.info('Cliente desconectado', {
				clientId: socket.id,
				reason,
				totalClients: clientCountAfter,
			});
		});
	});
};
