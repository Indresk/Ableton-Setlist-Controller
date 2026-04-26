let currentCue = null;
let startTime = null;
let pendingActions = [];

export const startCue = (cue) => {
	currentCue = cue;
	startTime = Date.now();

	pendingActions = cue.actions.map((a) => ({
		...a,
		executed: false,
	}));
};
