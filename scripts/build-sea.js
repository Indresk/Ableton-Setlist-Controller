import { execSync } from 'node:child_process';
execSync('node --build-sea build/sea-config.json', { stdio: 'inherit' });
