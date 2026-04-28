const state = {
	isPlaying: false,
	tempo: 120,
	songsCue: [],
	time: 0,
	currentSong: 0,
};

export const getState = () => state;

export const setState = (partial) => {
	Object.assign(state, partial);
};
