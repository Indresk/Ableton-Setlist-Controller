import { io } from 'socket.io-client';
import { useSocketStore } from '../store/socketStore.js';
import { useAbletonStore } from '../store/abletonStore.js';
import { EVENTS } from '../../../../packages/shared/events.js';

const socketPath = import.meta.env.DEV
	? 'http://localhost:3000'
	: window.location.origin;

export const socket = io(socketPath);

socket.on('connect', () => {
	useSocketStore.setState({ isConnected: true });

	// Resync con el servidor usando el último ID de evento que conocemos
	const { lastEventId } = useAbletonStore.getState();
	socket.emit(EVENTS.CLIENT.SYNC, lastEventId);
});

socket.on('disconnect', () => {
	useSocketStore.setState({ isConnected: false });
});
