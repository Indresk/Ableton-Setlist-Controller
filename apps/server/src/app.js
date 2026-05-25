import express from 'express';
import healthRoute from './routes/health.route.js';
import __dirname from './utils/dirname.js';
import path from 'path';

const app = express();

// Servir el build del cliente React desde apps/client/dist
const clientDistPath = path.join(__dirname, '../../client', 'dist');
app.use(express.static(clientDistPath));

app.use(express.json());
app.use('/health', healthRoute);

// Fallback SPA: cualquier ruta no encontrada sirve el index.html del cliente.
// Usa la misma ruta calculada que el middleware de static para consistencia.
app.get('/{*build}', (req, res) => {
	res.sendFile(path.join(clientDistPath, 'index.html'));
});

export default app;
