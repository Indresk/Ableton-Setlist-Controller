import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import __dirname from '../../utils/dirname.js';
import { logger } from '../../utils/logger.js';

const workerPath = process.env.IS_SEA
	? path.join(__dirname, 'db.worker.js')
	: path.join(__dirname, '../src/db/db.worker.js');
const worker = new Worker(workerPath);

const pendingPromises = new Map();

worker.on('message', (msg) => {
	const { id, result, error } = msg;
	const deferred = pendingPromises.get(id);

	if (deferred) {
		if (error) {
			deferred.reject(new Error(error));
		} else {
			deferred.resolve(result);
		}
		pendingPromises.delete(id);
	}
});

worker.on('error', (err) => {
	logger.error('Error crítico en DB Worker', { error: err.message });
});

worker.on('exit', (code) => {
	if (code !== 0) {
		logger.error(`DB Worker finalizó con código de salida ${code}`);
	}
});

function executeDbTask(action, args = []) {
	return new Promise((resolve, reject) => {
		const id = randomUUID();
		pendingPromises.set(id, { resolve, reject });
		worker.postMessage({ id, action, args });
	});
}

export const dbService = {
	saveEvent: (id, eventType, payload) =>
		executeDbTask('saveEvent', [id, eventType, payload]),
	getMaxEventId: () => executeDbTask('getMaxEventId'),
	getEventsSince: (lastEventId) =>
		executeDbTask('getEventsSince', [lastEventId]),
	saveSetlist: (songs, name) => executeDbTask('saveSetlist', [songs, name]),
	loadActiveSetlist: () => executeDbTask('loadActiveSetlist'),
	listSetlists: () => executeDbTask('listSetlists'),
	loadSetlistById: (id) => executeDbTask('loadSetlistById', [id]),
};
