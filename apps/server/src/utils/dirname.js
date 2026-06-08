import path from 'path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const __dirname = process.env.IS_SEA
	? path.dirname(process.execPath)
	: path.join(path.dirname(filename), '../');

export default __dirname;
