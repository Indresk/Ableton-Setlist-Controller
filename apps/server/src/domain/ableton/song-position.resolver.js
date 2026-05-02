export const findCurrentSong = (songs, time) => {
	let index = null;
	const findedSong =
		songs.find((song, i) => {
			if (time >= song.start && time < song.end) {
				index = i;
				return song;
			}
		}) ?? null;
	return { ...findedSong, index };
};

export const findCurrentSection = (sections = [], time) => {
	for (let i = 0; i < sections.length; i++) {
		const current = sections[i];
		const next = sections[i + 1];

		const sectionEnd = next ? next.time : Infinity;
		if (time >= current.time && time < sectionEnd) {
			return { ...current, index: i };
		}
	}

	return null;
};

export const resolvePlaybackContext = (songs, time) => {
	const currentSong = findCurrentSong(songs, time);
	const currentSection = currentSong
		? findCurrentSection(currentSong.sections, time)
		: null;

	const sectionIndex = currentSection?.index ?? null;
	return {
		currentSong: currentSong?.name ?? null,
		currentSongIndex: currentSong?.index ?? null,
		currentSection: currentSection?.name ?? null,
		currentSectionIndex: sectionIndex,
	};
};
