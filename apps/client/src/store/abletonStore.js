import { create } from 'zustand';

export const useAbletonStore = create((set) => ({
	isPlaying: false,
	tempo: 120,
	songsCue: [],
	time: 0,
	currentSong: 0,

	setState: (newState) => set(newState),
}));
