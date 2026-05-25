/**
 * Estado del servidor (no de Ableton).
 * Registra cuántos clientes están conectados por socket y si Ableton está conectado.
 * Separado de ableton.state para no mezclar estado de dominio con estado operativo.
 */

const serverState = {
	abletonConnected: false,
	connectedClients: 0,
	startedAt: Date.now(),
};

export const getServerState = () => ({ ...serverState });

export const setServerState = (partial) => {
	Object.assign(serverState, partial);
};
