import { useState, useCallback } from 'react';

const MAX_HISTORY = 10;

/**
 * Hook de historial temporal para el workingState del CueContainer.
 *
 * Separa estrictamente:
 *  - present: estado local que el usuario está editando
 *  - past: snapshots anteriores (undo)
 *  - future: snapshots descartados que pueden recuperarse (redo)
 *
 * La aplicación al servidor es responsabilidad del caller, no de este hook.
 *
 * @param {Array} initialState - Estado inicial (normalmente el activeRuntimeState)
 */
export function useCueHistory(initialState) {
	const [past, setPast] = useState([]);
	const [present, setPresent] = useState(initialState);
	const [future, setFuture] = useState([]);

	/**
	 * Actualiza el present y guarda el estado anterior en el historial.
	 * Borra el future (cualquier redo disponible se pierde tras una edición nueva).
	 */
	const set = useCallback((newPresent) => {
		setPast((prev) => {
			const next = [...prev, present];
			// Limitar al máximo de pasos
			return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
		});
		setPresent(newPresent);
		setFuture([]);
	}, [present]);

	/**
	 * Retrocede un snapshot. El present actual pasa al future.
	 */
	const undo = useCallback(() => {
		if (past.length === 0) return;
		const previous = past[past.length - 1];
		setPast((prev) => prev.slice(0, prev.length - 1));
		setFuture((prev) => [present, ...prev]);
		setPresent(previous);
	}, [past, present]);

	/**
	 * Avanza un snapshot. El present actual pasa al past.
	 */
	const redo = useCallback(() => {
		if (future.length === 0) return;
		const next = future[0];
		setFuture((prev) => prev.slice(1));
		setPast((prev) => {
			const updated = [...prev, present];
			return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
		});
		setPresent(next);
	}, [future, present]);

	/**
	 * Sincroniza el present con un estado externo (ej. activeRuntimeState del servidor).
	 * El present NO confirmado que el usuario tenía se empuja al historial
	 * para que pueda recuperarlo via undo.
	 */
	const syncFromRuntime = useCallback((runtimeState) => {
		setPast((prev) => {
			const next = [...prev, present];
			return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
		});
		setPresent(runtimeState);
		setFuture([]);
	}, [present]);

	/**
	 * Descarta el workingState y vuelve exactamente al runtimeState dado.
	 * No lo guarda en historial porque es un descarte explícito del usuario.
	 */
	const discardToRuntime = useCallback((runtimeState) => {
		setPast([]);
		setPresent(runtimeState);
		setFuture([]);
	}, []);

	return {
		present,
		set,
		undo,
		redo,
		syncFromRuntime,
		discardToRuntime,
		canUndo: past.length > 0,
		canRedo: future.length > 0,
	};
}
