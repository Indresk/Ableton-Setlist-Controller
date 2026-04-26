import { Server } from 'socket.io';
import { registerAbletonHandlers } from './ableton.socket.js';

export const initSockets = (server) => {
	const io = new Server(server, {
		cors: { origin: '*' },
	});

	io.on('connection', (socket) => {
		console.log('Client connected');

		registerAbletonHandlers(io, socket);
	});
};
