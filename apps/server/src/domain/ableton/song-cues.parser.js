import { SONG_END } from './song-cues.constants.js';

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

		if (cue.name.endsWith('+')) {
			currentSong = {
				id: cue.id,
				name: cue.name.replace(/[\s+]$/, '').trim(),
				start: cue.time,
			};
			innerCues = [];

			continue;
		}

		if (currentSong) innerCues.push(cue);
	}

	return songs;
};
