import { parentPort } from 'node:worker_threads';
import { DatabaseSync } from 'node:sqlite';
import { initSchema } from './schema.js';
import path from 'node:path';
import __dirname from '../utils/dirname.js';
import sea from 'node:sea';

const dbPath = sea.isSea()
	? path.join(__dirname, 'setlist.db')
	: path.join(__dirname, '../src/db/setlist.db');
const db = new DatabaseSync(dbPath);
initSchema(db);

const EVENT_LOG_LIMIT = 100;
const ACTIVE_SETLIST_KEY = 'active_setlist_id';

const handlers = {
	saveEvent: (id, eventType, payload) => {
		const stmt = db.prepare(
			'INSERT INTO event_log (id, event_type, payload, created_at) VALUES (?, ?, ?, ?)',
		);
		stmt.run(id, eventType, JSON.stringify(payload), Date.now());

		db.prepare(
			`DELETE FROM event_log WHERE id <= (
				SELECT id FROM event_log ORDER BY id DESC LIMIT 1 OFFSET ?
			)`,
		).run(EVENT_LOG_LIMIT);
	},

	getMaxEventId: () => {
		const row = db.prepare('SELECT MAX(id) as maxId FROM event_log').get();
		return row && row.maxId ? row.maxId : 0;
	},

	getEventsSince: (lastEventId) => {
		const stmt = db.prepare(
			'SELECT * FROM event_log WHERE id > ? ORDER BY id ASC',
		);
		const rows = stmt.all(lastEventId);
		return rows.map((row) => ({
			...row,
			payload: JSON.parse(row.payload),
		}));
	},

	saveSetlist: (songs, name) => {
		if (!name || !name.trim()) {
			const nowDate = new Date();
			name =
				nowDate.toLocaleDateString('es-CO', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				}) +
				' ' +
				nowDate.toLocaleTimeString('es-CO', {
					hour: '2-digit',
					minute: '2-digit',
				});
		}
		const now = Date.now();

		const existing = db
			.prepare('SELECT id FROM setlists WHERE name = ?')
			.get(name);
		let setlistId;

		if (existing) {
			setlistId = existing.id;
			db.prepare('UPDATE setlists SET updated_at = ? WHERE id = ?').run(
				now,
				setlistId,
			);
			db.prepare('DELETE FROM setlist_songs WHERE setlist_id = ?').run(
				setlistId,
			);
		} else {
			const result = db
				.prepare(
					'INSERT INTO setlists (name, created_at, updated_at) VALUES (?, ?, ?)',
				)
				.run(name, now, now);
			setlistId = result.lastInsertRowid;
		}

		const insertSong = db.prepare(
			`INSERT INTO setlist_songs (setlist_id, ableton_song_id, song_name, position)
             VALUES (?, ?, ?, ?)`,
		);
		songs.forEach((song, index) => {
			insertSong.run(setlistId, String(song.id), song.name, index);
		});

		db.prepare(
			`INSERT INTO app_settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
		).run(ACTIVE_SETLIST_KEY, String(setlistId));

		return setlistId;
	},

	loadActiveSetlist: () => {
		const setting = db
			.prepare('SELECT value FROM app_settings WHERE key = ?')
			.get(ACTIVE_SETLIST_KEY);

		if (!setting) return null;

		const setlistId = Number(setting.value);
		const songs = db
			.prepare(
				`SELECT ableton_song_id, song_name, position
                 FROM setlist_songs
                 WHERE setlist_id = ?
                 ORDER BY position ASC`,
			)
			.all(setlistId);

		return songs.length > 0 ? songs : null;
	},

	listSetlists: () => {
		return db
			.prepare(
				'SELECT id, name, created_at, updated_at FROM setlists ORDER BY updated_at DESC',
			)
			.all();
	},

	loadSetlistById: (id) => {
		const songs = db
			.prepare(
				`SELECT ableton_song_id, song_name, position
                 FROM setlist_songs
                 WHERE setlist_id = ?
                 ORDER BY position ASC`,
			)
			.all(Number(id));

		return songs.length > 0 ? songs : null;
	},
};

parentPort.on('message', (msg) => {
	const { id, action, args } = msg;
	try {
		if (!handlers[action]) {
			throw new Error(`Unknown action: ${action}`);
		}

		const result = handlers[action](...(args || []));
		parentPort.postMessage({ id, result });
	} catch (error) {
		parentPort.postMessage({ id, error: error.message });
	}
});
