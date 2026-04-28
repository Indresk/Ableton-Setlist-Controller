import { Server } from 'socket.io';
import {
	registerAbletonBroadcaster,
	registerAbletonHandlers,
} from './ableton.socket.js';

export const initSockets = (server) => {
	const io = new Server(server, {
		cors: { origin: '*' },
	});
	registerAbletonBroadcaster(io);

	io.on('connection', (socket) => {
		console.log('Client connected');

		registerAbletonHandlers(io, socket);
	});
};
