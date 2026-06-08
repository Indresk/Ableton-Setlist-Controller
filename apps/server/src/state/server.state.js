const serverState = {
	abletonConnected: false,
	abletonConnectionState: 'DISCONNECTED',
	connectedClients: 0,
	startedAt: Date.now(),
};

export const getServerState = () => ({ ...serverState });

export const setServerState = (partial) => {
	Object.assign(serverState, partial);

	if (partial.abletonConnectionState !== undefined) {
		serverState.abletonConnected =
			partial.abletonConnectionState === 'CONNECTED';
	} else if (partial.abletonConnected !== undefined) {
		serverState.abletonConnectionState = partial.abletonConnected
			? 'CONNECTED'
			: 'DISCONNECTED';
	}
};
