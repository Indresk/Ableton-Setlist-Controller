import { createServer } from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { initAbleton } from './services/ableton/boot.service.js';
import { getIP } from './utils/getIP.js';

const server = createServer(app);

initSockets(server);
initAbleton();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server running on http://${getIP()}:${PORT}`);
});
