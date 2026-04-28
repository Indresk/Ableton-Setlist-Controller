export const normalizeCuePoint = (point) => ({
	...point.raw,
	name: point.raw.name.trim().toLowerCase(),
});

export const normalizeCuePoints = (rawCuePoints) =>
	rawCuePoints.map(normalizeCuePoint);
