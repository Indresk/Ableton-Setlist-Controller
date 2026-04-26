import { execute } from './executor.js';
const TICK = 25;

export const startScheduler = () => {
	setInterval(() => {
		const now = Date.now();

		pendingActions.forEach((action) => {
			if (!action.executed && shouldTrigger(action, now)) {
				execute(action);
				action.executed = true;
			}
		});
	}, TICK);
};
