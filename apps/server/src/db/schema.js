/**
 * Schema de la base de datos SQLite.
 *
 * Tablas:
 *  - setlists:       Colecciones nombradas de canciones con un orden definido por el usuario.
 *  - setlist_songs:  Canciones dentro de cada setlist, referenciadas por su ID de Ableton.
 *  - app_settings:   Pares clave/valor para configuración persistente (ej. setlist activa).
 *
 * Diseño para Fase 4:
 *  - setlists soporta múltiples snapshots nombrados.
 *  - ableton_song_id es la clave de reconciliación contra Ableton (fuente de verdad).
 *  - Al cargar un setlist se cotejan los IDs contra los cue points actuales de Ableton:
 *      · Canción en DB pero no en Ableton → se elimina del setlist cargado.
 *      · Canción en Ableton pero no en DB → se agrega al final del setlist.
 *      · Canción en ambos → se mantiene el orden del DB, datos (tiempos/secciones) de Ableton.
 */

export function initSchema(db) {
	db.exec(`
    CREATE TABLE IF NOT EXISTS setlists (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL DEFAULT 'Unnamed',
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS setlist_songs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      setlist_id      INTEGER NOT NULL,
      ableton_song_id TEXT    NOT NULL,
      song_name       TEXT    NOT NULL,
      position        INTEGER NOT NULL,
      FOREIGN KEY (setlist_id) REFERENCES setlists(id) ON DELETE CASCADE,
      UNIQUE (setlist_id, ableton_song_id)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
