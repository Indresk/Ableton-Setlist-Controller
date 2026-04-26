const state = {
	isPlaying: false,
	tempo: 120,
};

export const getState = () => state;

export const setState = (partial) => {
	Object.assign(state, partial);
};
