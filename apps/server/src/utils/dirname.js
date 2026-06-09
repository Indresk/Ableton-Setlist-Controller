import path from 'path';
import { fileURLToPath } from 'node:url';
import sea from 'node:sea';

let dirCalculation = '';
if (sea.isSea()) {
	dirCalculation = path.dirname(process.execPath);
} else {
	const filename = fileURLToPath(import.meta.url);
	dirCalculation = path.join(path.dirname(filename), '../');
}

const __dirname = dirCalculation;

export default __dirname;
