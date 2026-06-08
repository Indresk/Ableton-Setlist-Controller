import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { socket } from './socket/socket.js';
import { useAbletonStore } from './store/abletonStore.js';
import { useSocketStore } from './store/socketStore.js';
import { EVENTS } from '../../../packages/shared/events.js';
import { BrowserRouter } from 'react-router';
import './index.css';

socket.on(EVENTS.SERVER.FULL_STATE, (state) => {
	useAbletonStore.setState(state);
});

socket.on(EVENTS.SERVER.STATE_UPDATE, (state) => {
	useAbletonStore.setState(state);
});

socket.on(EVENTS.SERVER.ABLETON_STATUS, (status) => {
	useSocketStore.setState({ abletonConnected: status.connected });
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
