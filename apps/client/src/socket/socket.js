import { io } from 'socket.io-client';
import { useSocketStore } from '../store/socketStore';

const socketPath = import.meta.env.DEV
	? 'http://localhost:3000'
	: window.location.origin;

export const socket = io(socketPath);

socket.on('connect', () => {
	useSocketStore.setState({ isConnected: true });
});

socket.on('disconnect', () => {
	useSocketStore.setState({ isConnected: false });
});
