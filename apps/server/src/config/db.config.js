import sqlite from 'node:sqlite';
import __dirname from '../utils/dirname.js';
import path from 'node:path';
import { initSchema } from '../db/schema.js';

const { DatabaseSync } = sqlite;

// Nombre significativo de producción. El antiguo test.db puede coexistir
// sin conflicto mientras se migra a este archivo.
const DB_FILENAME = 'setlist.db';
const dbPath = path.join(__dirname, 'db', DB_FILENAME);

export const database = new DatabaseSync(dbPath);

// Inicializar tablas si no existen (idempotente — no rompe DB existente).
initSchema(database);
