/**
 * Repositorio de setlists.
 *
 * Responsabilidades:
 *  - Guardar el orden de canciones definido por el usuario en un setlist nombrado.
 *  - Cargar el setlist más reciente (el activo).
 *  - Reconciliar un setlist de la DB con el estado actual de Ableton antes de cargarlo.
 *
 * Reglas de reconciliación (Ableton es fuente de verdad):
 *  1. Canción en DB pero NO en Ableton → se excluye del resultado.
 *  2. Canción en Ableton pero NO en DB → se agrega al final del resultado.
 *  3. Canción en ambos → se usa el orden del DB, pero los datos (secciones, tiempos) vienen de Ableton.
 *
 * Nota: Las secciones e información temporal de cada canción siempre provienen de Ableton.
 * La DB solo almacena el ID y nombre de la canción y su posición en el setlist.
 */

const ACTIVE_SETLIST_KEY = 'active_setlist_id';

// ─── Escritura ────────────────────────────────────────────────────────────────

/**
 * Guarda o actualiza un setlist por nombre.
 * Si ya existe un setlist con ese nombre, lo reemplaza (borra canciones previas y reinserta).
 * Retorna el id del setlist guardado.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {Array<{id: string, name: string}>} songs - songs en el orden deseado
 * @param {string} [name='last-saved']
 * @returns {number} id del setlist
 */
export function saveSetlist(db, songs, name) {
	// Si no se pasa nombre, generamos uno automático con fecha/hora legible
	if (!name || !name.trim()) {
		const nowDate = new Date();
		name = nowDate.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
			+ ' ' + nowDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
	}
	const now = Date.now();

	// Buscar setlist existente por nombre
	const existing = db
		.prepare('SELECT id FROM setlists WHERE name = ?')
		.get(name);

	let setlistId;

	if (existing) {
		setlistId = existing.id;
		// Actualizar timestamp
		db.prepare('UPDATE setlists SET updated_at = ? WHERE id = ?').run(
			now,
			setlistId,
		);
		// Borrar canciones anteriores para reinsertar con orden nuevo
		db.prepare('DELETE FROM setlist_songs WHERE setlist_id = ?').run(setlistId);
	} else {
		const result = db
			.prepare(
				'INSERT INTO setlists (name, created_at, updated_at) VALUES (?, ?, ?)',
			)
			.run(name, now, now);
		setlistId = result.lastInsertRowid;
	}

	// Insertar canciones en el orden recibido
	const insertSong = db.prepare(
		`INSERT INTO setlist_songs (setlist_id, ableton_song_id, song_name, position)
     VALUES (?, ?, ?, ?)`,
	);
	songs.forEach((song, index) => {
		insertSong.run(setlistId, String(song.id), song.name, index);
	});

	// Marcar como setlist activo
	db.prepare(
		`INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
	).run(ACTIVE_SETLIST_KEY, String(setlistId));

	return setlistId;
}

// ─── Lectura ─────────────────────────────────────────────────────────────────

/**
 * Carga el setlist activo de la DB.
 * Retorna null si no hay ninguno guardado.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {Array<{ableton_song_id: string, song_name: string, position: number}> | null}
 */
export function loadActiveSetlist(db) {
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
}

/**
 * Retorna todos los setlists guardados (metadata, sin canciones).
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {Array<{id: number, name: string, created_at: number, updated_at: number}>}
 */
export function listSetlists(db) {
	return db
		.prepare(
			'SELECT id, name, created_at, updated_at FROM setlists ORDER BY updated_at DESC',
		)
		.all();
}

/**
 * Carga las canciones de un setlist por su ID (sólo lectura).
 * No aplica el setlist al servidor ni modifica ningún estado.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number} id
 * @returns {Array<{ableton_song_id: string, song_name: string, position: number}> | null}
 */
export function loadSetlistById(db, id) {
	const songs = db
		.prepare(
			`SELECT ableton_song_id, song_name, position
       FROM setlist_songs
       WHERE setlist_id = ?
       ORDER BY position ASC`,
		)
		.all(Number(id));

	return songs.length > 0 ? songs : null;
}

// ─── Reconciliación ───────────────────────────────────────────────────────────

/**
 * Coteja el orden guardado en la DB con las canciones actuales de Ableton.
 * Siempre retorna un array válido de canciones listas para usar.
 *
 * Reglas aplicadas:
 *  1. Canciones en DB pero no en Ableton → se eliminan.
 *  2. Canciones en Ableton pero no en DB → se agregan al final.
 *  3. Canciones en ambos → orden del DB, datos completos de Ableton.
 *
 * @param {Array<{ableton_song_id: string}>} savedSongs — filas de la DB
 * @param {Array<{id: string, name: string, sections: Array, start: number, end: number}>} abletonSongs
 * @returns {Array} — canciones reconciliadas en el orden correcto
 */
export function reconcileSetlistWithAbleton(savedSongs, abletonSongs) {
	const abletonMap = new Map(abletonSongs.map((s) => [String(s.id), s]));
	const savedIds = new Set(savedSongs.map((s) => s.ableton_song_id));

	// 1 y 3: mantener las que existen en Ableton, en el orden del DB
	const reconciled = savedSongs
		.filter((saved) => abletonMap.has(saved.ableton_song_id))
		.map((saved) => abletonMap.get(saved.ableton_song_id));

	// 2: agregar al final las canciones de Ableton que no estaban en el DB
	for (const abletonSong of abletonSongs) {
		if (!savedIds.has(String(abletonSong.id))) {
			reconciled.push(abletonSong);
		}
	}

	return reconciled;
}
