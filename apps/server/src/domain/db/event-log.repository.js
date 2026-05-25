import { logger } from '../../utils/logger.js';

const EVENT_LOG_LIMIT = 100;

/**
 * Guarda un evento en la tabla event_log.
 * Automáticamente purga los eventos antiguos para mantener un máximo de EVENT_LOG_LIMIT.
 * 
 * @param {import('better-sqlite3').Database} db
 * @param {string} eventType Tipo de evento (ej. 'STATE_UPDATE')
 * @param {object} payload Datos del evento
 * @returns {number} El ID monotónico (event_id) generado para este evento
 */
export function saveEvent(db, eventType, payload) {
	try {
		const stmt = db.prepare(
			'INSERT INTO event_log (event_type, payload, created_at) VALUES (?, ?, ?)'
		);
		
		const result = stmt.run(eventType, JSON.stringify(payload), Date.now());
		const eventId = result.lastInsertRowid;

		// Purga asíncrona (o síncrona en sqlite, es muy rápida) para mantener el límite
		db.prepare(
			`DELETE FROM event_log WHERE id <= (
				SELECT id FROM event_log ORDER BY id DESC LIMIT 1 OFFSET ?
			)`
		).run(EVENT_LOG_LIMIT);

		return eventId;
	} catch (error) {
		logger.error('Error al guardar evento en event_log', { error: error.message });
		throw error;
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
