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
				'ui/index.html': 'apps/client/dist/index.html',
				'ui/assets/index.js': 'apps/client/dist/assets/index.js',
				'ui/assets/index.css': 'apps/client/dist/assets/index.css',
			},
			disableExperimentalSEAWarning: true,
			useCodeCache: true,
		},
		null,
		2,
	),
);
