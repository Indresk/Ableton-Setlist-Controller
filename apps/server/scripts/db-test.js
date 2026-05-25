import { database } from '../../config/db.config.js';

// database.exec(`
//   CREATE TABLE data(
//     key INTEGER PRIMARY KEY,
//     value TEXT
//   ) STRICT
// `);

const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');

// insert.run(1, 'hello');
// insert.run(2, 'world');
insert.run(3, 'pepe');

const query = database.prepare('SELECT * FROM data ORDER BY key');

console.log(query.all());
