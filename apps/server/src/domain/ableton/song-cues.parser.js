import { SONG_END, SONG_SECTIONS } from './song-cues.constants.js';

const SONG_SECTIONS_SET = new Set(SONG_SECTIONS);

export const parseSongsFromCuePoints = (cuePoints) => {
	const songs = [];
	let currentSong = null;
	let innerCues = [];

	for (const cue of cuePoints) {
		if (cue.name === SONG_END) {
			innerCues.unshift({
				id: currentSong.id,
				name: 'song start',
				time: currentSong.start,
			});
			if (currentSong) {
				songs.push({
					...currentSong,
					end: cue.time,
					sections: [...innerCues],
				});
			}
			currentSong = null;
			innerCues = [];
			continue;
		}

		if (SONG_SECTIONS_SET.has(cue.name)) {
			if (currentSong) innerCues.push(cue);
			continue;
		}

		currentSong = {
			id: cue.id,
			name: cue.name,
			start: cue.time,
		};
		innerCues = [];
	}

	return songs;
};
