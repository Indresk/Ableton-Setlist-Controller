import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { socket } from './socket/socket.js';
import { useAbletonStore } from './store/abletonStore.js';
import { EVENTS } from '../../../packages/shared/events.js';

socket.on(EVENTS.SERVER.STATE_UPDATE, (state) => {
	useAbletonStore.getState().setState(state);
});

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
