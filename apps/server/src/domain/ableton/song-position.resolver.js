export const findCurrentSong = (songs, time) => {
	return songs.find((song) => time >= song.start && time < song.end) ?? null;
};

export const findCurrentSection = (sections = [], time) => {
	for (let i = 0; i < sections.length; i++) {
		const current = sections[i];
		const next = sections[i + 1];

		const sectionEnd = next ? next.time : Infinity;
		if (time >= current.time && time < sectionEnd) {
			return current;
		}
	}

	return null;
};

export const resolvePlaybackContext = (songs, time) => {
	const currentSong = findCurrentSong(songs, time);
	const currentSection = currentSong
		? findCurrentSection(currentSong.sections, time)
		: null;

	return {
		currentSong: currentSong?.name ?? null,
		currentSongId: currentSong?.id ?? null,
		currentSection: currentSection?.name ?? null,
	};
};
