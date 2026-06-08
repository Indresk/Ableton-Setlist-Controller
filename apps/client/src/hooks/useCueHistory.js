import { useState, useCallback } from 'react';

const MAX_HISTORY = 10;

export function useCueHistory(initialState) {
	const [past, setPast] = useState([]);
	const [present, setPresent] = useState(initialState);
	const [future, setFuture] = useState([]);

	const set = useCallback(
		(newPresent) => {
			setPast((prev) => {
				const next = [...prev, present];
				return next.length > MAX_HISTORY
					? next.slice(next.length - MAX_HISTORY)
					: next;
			});
			setPresent(newPresent);
			setFuture([]);
		},
		[present],
	);

	const undo = useCallback(() => {
		if (past.length === 0) return;
		const previous = past[past.length - 1];
		setPast((prev) => prev.slice(0, prev.length - 1));
		setFuture((prev) => [present, ...prev]);
		setPresent(previous);
	}, [past, present]);

	const redo = useCallback(() => {
		if (future.length === 0) return;
		const next = future[0];
		setFuture((prev) => prev.slice(1));
		setPast((prev) => {
			const updated = [...prev, present];
			return updated.length > MAX_HISTORY
				? updated.slice(updated.length - MAX_HISTORY)
				: updated;
		});
		setPresent(next);
	}, [future, present]);

	const syncFromRuntime = useCallback(
		(runtimeState) => {
			setPast((prev) => {
				const next = [...prev, present];
				return next.length > MAX_HISTORY
					? next.slice(next.length - MAX_HISTORY)
					: next;
			});
			setPresent(runtimeState);
			setFuture([]);
		},
		[present],
	);

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
