import os from 'node:os';
import fs from 'node:fs';
import sea from 'node:sea';
import crypto from 'node:crypto';
import path from 'node:path';

function createTempPath() {
	const tempPath = path.join(os.tmpdir(), 'ableton-control');
	fs.mkdirSync(tempPath, { recursive: true });

	return tempPath;
}

export function getBundledWorkerPath() {
	const raw = sea.getRawAsset('db.worker.js');
	const bytes = new Uint8Array(raw);
	const hash = crypto
		.createHash('sha256')
		.update(bytes)
		.digest('hex')
		.slice(0, 12);
	const filePath = path.join(createTempPath(), `db.worker-${hash}.js`);

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, bytes);
	}

	return filePath;
}

export function extractUiAssets() {
	const uiDir = path.join(createTempPath(), 'ui');
	fs.mkdirSync(uiDir, { recursive: true });

	for (const key of sea.getAssetKeys()) {
		if (!key.startsWith('ui/')) continue;

		const relPath = key.slice(3);
		const outPath = path.join(uiDir, relPath);
		fs.mkdirSync(path.dirname(outPath), { recursive: true });

		if (!fs.existsSync(outPath)) {
			const raw = sea.getRawAsset(key);
			fs.writeFileSync(outPath, new Uint8Array(raw));
		}
	}

	return uiDir;
}
