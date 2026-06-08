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

    CREATE TABLE IF NOT EXISTS event_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type  TEXT NOT NULL,
      payload     TEXT NOT NULL,
      created_at  INTEGER NOT NULL
    );
  `);
}
