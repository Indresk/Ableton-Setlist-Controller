import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { socket } from './socket/socket.js';
import { useAbletonStore } from './store/abletonStore.js';
import { EVENTS } from '../../../packages/shared/events.js';
import { BrowserRouter } from 'react-router';

socket.on(EVENTS.SERVER.STATE_UPDATE, (state) => {
	// console.log(state);
	useAbletonStore.setState(state);
});

createRoot(document.getElementById('root')).render(
	// <StrictMode>
	<BrowserRouter>
		<App />
	</BrowserRouter>,
	// </StrictMode>,
);
