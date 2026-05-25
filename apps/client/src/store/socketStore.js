import { create } from 'zustand';

export const useSocketStore = create((set) => ({
	isConnected: false,
	abletonConnected: false,

	setConnected: (state) => set(state),
}));

