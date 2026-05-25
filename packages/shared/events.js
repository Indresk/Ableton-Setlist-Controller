export const EVENTS = {
	CLIENT: {
		PLAY: 'client:play',
		CONTINUE: 'client:continue',
		STOP: 'client:stop',
		SET_TEMPO: 'client:set_tempo',
		GET_CUE: 'client:get_cue',
		SET_CUE: 'client:set_cue',
		PLAY_CUE: 'client:play_cue',
		REFRESH: 'client:refresh',
		SYNC: 'client:sync',
	},
	SERVER: {
		STATE_UPDATE: 'server:state_update',
		FULL_STATE: 'server:full_state',
		ABLETON_STATUS: 'server:ableton_status',
	},
};
