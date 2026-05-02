import { create } from 'zustand';

export const useAbletonStore = create((set) => ({
	isPlaying: false,
	tempo: 120,
	songsCue: [],
	currentSong: 0,
	currentSection: 0,
	time: 0,

	setState: (newState) => set(newState),
}));
