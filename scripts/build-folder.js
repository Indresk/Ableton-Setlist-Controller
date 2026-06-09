import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('build', { recursive: true });

writeFileSync(
	'build/sea-config.json',
	JSON.stringify(
		{
			main: 'build/server.js',
			output: 'build/ableton-control.exe',
			assets: {
				'db.worker.js': 'build/db.worker.js',
			},
			disableExperimentalSEAWarning: true,
			useCodeCache: true,
		},
		null,
		2,
	),
);
