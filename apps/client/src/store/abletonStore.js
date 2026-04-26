import { create } from 'zustand';

export const useAbletonStore = create((set) => ({
	isPlaying: false,
	tempo: 120,

	setState: (newState) => set(newState),
}));
