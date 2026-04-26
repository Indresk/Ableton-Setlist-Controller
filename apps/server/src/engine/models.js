// Propuesta de toma de clips para lanzar eventos, probablemente se elimine o no se use a futuro

let CueList = {
	id: 'set-1',
	name: 'Live Set',
	cues: [Cue],
};

let Cue = {
	id: 'cue-1',
	name: 'Intro',
	tempo: 120,
	timeSignature: '4/4',
	length: 32, // en beats o compases
	actions: [Action],
	follow: {
		type: 'auto' | 'manual',
		targetCueId: 'cue-2',
	},
};

let Action = {
	id: 'action-1',
	type: 'PLAY_CLIP' | 'STOP' | 'SET_TEMPO' | 'MIDI' | 'CUSTOM',

	trigger: {
		type: 'immediate' | 'beat' | 'time',
		value: 0, // ej: beat 0, beat 16, ms 5000
	},

	payload: {
		trackId: 1,
		clipId: 3,
	},
};
