import { EventEmitter } from 'node:events';

export const abletonEventManager = new EventEmitter();

export const ABLETON_EVENTS = {
	STATE_CHANGE: 'ableton:stateChanged',
};
