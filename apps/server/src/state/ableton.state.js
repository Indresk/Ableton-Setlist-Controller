const state = {
	isPlaying: false,
	tempo: 120,
	songsCue: [],
	currentSong: 0,
	currentSection: 0,
	time: 0,
};

export const getState = () => state;

export const setState = (partial) => {
	Object.assign(state, partial);
};
