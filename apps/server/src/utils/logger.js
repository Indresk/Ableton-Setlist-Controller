/**
 * Logger estructurado para el servidor.
 * Emite líneas JSON con timestamp, nivel y contexto opcional.
 * Niveles: debug < info < warn < error
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = process.env.LOG_LEVEL ?? 'info';
const minLevelValue = LEVELS[MIN_LEVEL] ?? LEVELS.info;

function formatEntry(level, message, context) {
	const entry = {
		ts: new Date().toISOString(),
		level,
		msg: message,
		...(context && Object.keys(context).length > 0 ? { ctx: context } : {}),
	};
	return JSON.stringify(entry);
}

function log(level, message, context = {}) {
	if (LEVELS[level] < minLevelValue) return;
	const line = formatEntry(level, message, context);
	if (level === 'error' || level === 'warn') {
		process.stderr.write(line + '\n');
	} else {
		process.stdout.write(line + '\n');
	}
}

export const logger = {
	debug: (msg, ctx) => log('debug', msg, ctx),
	info: (msg, ctx) => log('info', msg, ctx),
	warn: (msg, ctx) => log('warn', msg, ctx),
	error: (msg, ctx) => log('error', msg, ctx),
};
