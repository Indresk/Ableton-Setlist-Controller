import { normalizeCuePoints } from '../../domain/ableton/cue-point.mapper.js';
import { parseSongsFromCuePoints } from '../../domain/ableton/song-cues.parser.js';
import { getRawCuePoints } from './ableton.service.js';

export const getSongsCue = async () => {
	const rawCuePoints = await getRawCuePoints();
	const cuePoints = normalizeCuePoints(rawCuePoints);
	return parseSongsFromCuePoints(cuePoints);
};
