import sqlite from 'node:sqlite';
import __dirname from '../utils/dirname.js';
import path from 'node:path';

const { DatabaseSync } = sqlite;
const dbName = './test.db';
const dbPath = path.join(__dirname, 'db', dbName);

export const database = new DatabaseSync(dbPath);
