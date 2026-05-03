import { create } from 'zustand';

export const useSocketStore = create((set) => ({
	isConnected: false,

	setConnected: (state) => set(state),
}));
