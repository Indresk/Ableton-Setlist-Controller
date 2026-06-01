import { logger } from '../../utils/logger.js';

const EVENT_LOG_LIMIT = 100;

/**
 * Guarda un evento en la tabla event_log usando un ID explícito generado en memoria.
 * Automáticamente purga los eventos antiguos para mantener un máximo de EVENT_LOG_LIMIT.
 * 
 * @param {import('better-sqlite3').Database} db
 * @param {number} id ID explícito generado por la aplicación
 * @param {string} eventType Tipo de evento (ej. 'STATE_UPDATE')
 * @param {object} payload Datos del evento
 */
export function saveEvent(db, id, eventType, payload) {
	try {
		const stmt = db.prepare(
			'INSERT INTO event_log (id, event_type, payload, created_at) VALUES (?, ?, ?, ?)'
		);
		
		stmt.run(id, eventType, JSON.stringify(payload), Date.now());

		// Purga asíncrona (o síncrona en sqlite, es muy rápida) para mantener el límite
		db.prepare(
			`DELETE FROM event_log WHERE id <= (
				SELECT id FROM event_log ORDER BY id DESC LIMIT 1 OFFSET ?
			)`
		).run(EVENT_LOG_LIMIT);

	} catch (error) {
		logger.error('Error al guardar evento en event_log', { error: error.message });
	}
}

/**
 * Obtiene el ID máximo actual en la tabla event_log.
 * Útil para inicializar el contador en memoria al arrancar.
 * 
 * @param {import('better-sqlite3').Database} db
 * @returns {number} El último ID registrado o 0 si está vacía
 */
export function getMaxEventId(db) {
	try {
		const row = db.prepare('SELECT MAX(id) as maxId FROM event_log').get();
		return row && row.maxId ? row.maxId : 0;
	} catch (error) {
		logger.error('Error al obtener el ID máximo de event_log', { error: error.message });
		return 0;
	}
}

/**
 * Recupera eventos ocurridos después de un eventId dado.
 * 
 * @param {import('better-sqlite3').Database} db
 * @param {number} lastEventId Último ID que el cliente conoce
 * @returns {Array<{id: number, event_type: string, payload: object, created_at: number}>}
 */
export function getEventsSince(db, lastEventId) {
	try {
		const stmt = db.prepare(
			'SELECT * FROM event_log WHERE id > ? ORDER BY id ASC'
		);
		const rows = stmt.all(lastEventId);
		
		return rows.map(row => ({
			...row,
			payload: JSON.parse(row.payload)
		}));
	} catch (error) {
		logger.error('Error al recuperar eventos', { error: error.message, lastEventId });
		return [];
	}
}
