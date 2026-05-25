/**
 * Estado del servidor (no de Ableton).
 * Registra cuántos clientes están conectados por socket y si Ableton está conectado.
 * Separado de ableton.state para no mezclar estado de dominio con estado operativo.
 */

const serverState = {
	abletonConnected: false, // Mantenido por retrocompatibilidad con /health
	abletonConnectionState: 'DISCONNECTED', // DISCONNECTED | CONNECTING | CONNECTED | RECONNECTING
	connectedClients: 0,
	startedAt: Date.now(),
};

export const getServerState = () => ({ ...serverState });

export const setServerState = (partial) => {
	Object.assign(serverState, partial);
	
	// Mantener retrocompatibilidad si alguien actualiza el nuevo estado
	if (partial.abletonConnectionState !== undefined) {
		serverState.abletonConnected = partial.abletonConnectionState === 'CONNECTED';
	} else if (partial.abletonConnected !== undefined) {
		serverState.abletonConnectionState = partial.abletonConnected ? 'CONNECTED' : 'DISCONNECTED';
	}
};
