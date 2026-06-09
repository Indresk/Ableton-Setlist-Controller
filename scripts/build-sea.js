import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

execSync('node --build-sea build/sea-config.json', { stdio: 'inherit' });

function cleanupBuildSea() {
	const filesToDelete = [
		'build/server.js',
		'build/sea-config.json',
		'build/db.worker.js',
	];

	for (const file of filesToDelete) {
		const fullPath = path.resolve(file);
		if (fs.existsSync(fullPath)) {
			fs.rmSync(fullPath, { force: true });
		}
	}
}

cleanupBuildSea();
