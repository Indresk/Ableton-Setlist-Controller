import { Server } from 'socket.io';
import {
	registerAbletonBroadcaster,
	registerAbletonHandlers,
} from './ableton.socket.js';
import { setServerState } from '../state/server.state.js';
import { logger } from '../utils/logger.js';

export const initSockets = (server) => {
	const io = new Server(server, {
		// CORS abierto para acceso desde dispositivos de la red local (LAN).
		// Este sistema corre en localhost y se accede via IP local del router,
		// por lo que '*' es aceptable y esperado en este contexto.
		cors: { origin: '*' },
	});

	// Broadcaster de eventos de Ableton → todos los clientes conectados
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
