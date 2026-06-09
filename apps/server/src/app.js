import express from 'express';
import healthRoute from './routes/health.route.js';
import __dirname from './utils/dirname.js';
import path from 'path';
import sea from 'node:sea';
import { extractUiAssets } from './utils/tempFilesGenerator.js';

const app = express();

const clientDistPath = sea.isSea()
	? extractUiAssets()
	: path.join(__dirname, '../../client', 'dist');

app.use(express.static(clientDistPath));

app.use(express.json());
app.use('/health', healthRoute);

app.get('/{*build}', (req, res) => {
	res.sendFile(path.join(clientDistPath, 'index.html'));
});

export default app;
