import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';
import { useAbletonStore } from '../store/abletonStore.js';
import { useEffect, useRef, useState } from 'react';
import DraggeableCard from './DraggeableCard.jsx';
import { EVENTS } from '../../../../packages/shared/events.js';
import { socket } from '../socket/socket.js';
import PlayAtArrow from './PlayAtArrow.jsx';
import { useCueHistory } from '../hooks/useCueHistory.js';
import './CueContainer.css';

export default function CueContainer() {
	// ── Estado del servidor (fuente de verdad, sólo lectura aquí) ───────────
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);

	// ── Historial de trabajo local ───────────────────────────────────────────
	const {
		present,
		set,
		undo,
		redo,
		syncFromRuntime,
		discardToRuntime,
		canUndo,
		canRedo,
	} = useCueHistory(songsCue);

	// Detectar si el workingState diverge del activeRuntimeState
	const isDirty =
		present !== songsCue &&
		JSON.stringify(present) !== JSON.stringify(songsCue);

	// Cuando el servidor actualiza el orden (otro cliente, Ableton, etc.),
	// guardamos el draft actual en el historial y sincronizamos.
	const prevSongsCue = useRef(songsCue);
	useEffect(() => {
		if (prevSongsCue.current !== songsCue) {
			prevSongsCue.current = songsCue;
			// Si el usuario tenía cambios locales, los preservamos en historial
			syncFromRuntime(songsCue);
		}
	}, [songsCue]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Persistencia de setlists ─────────────────────────────────────────────
	const [setlists, setSetlists] = useState([]);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [saveName, setSaveName] = useState('');
	const [showLoadPanel, setShowLoadPanel] = useState(false);

	// Cargar listado de setlists al abrir el panel
	useEffect(() => {
		if (showLoadPanel) {
			socket.emit(EVENTS.CLIENT.FETCH_SETLISTS, (res) => {
				if (res.ok) setSetlists(res.data);
			});
		}
	}, [showLoadPanel]);

	// ── Sensores DnD ─────────────────────────────────────────────────────────
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	// ── Handlers ─────────────────────────────────────────────────────────────
	function handleDragEnd({ active, over }) {
		if (!over || active.id === over.id) return;
		const oldIndex = present.findIndex((s) => s.id === active.id);
		const newIndex = present.findIndex((s) => s.id === over.id);
		set(arrayMove(present, oldIndex, newIndex));
	}

	// Aplica el workingState al servidor (lo convierte en activeRuntimeState)
	function handleConfirmApply() {
		socket.emit(EVENTS.CLIENT.SET_CUE, present, (res) => {
			if (!res?.ok)
				console.error('[CueContainer] Error al aplicar orden:', res?.error);
		});
	}

	// Guarda el workingState como setlist persistente con nombre
	function handleSaveSetlist() {
		socket.emit(
			EVENTS.CLIENT.SAVE_SETLIST,
			{ songs: present, name: saveName.trim() || undefined },
			(res) => {
				if (res?.ok) {
					setShowSaveModal(false);
					setSaveName('');
				} else {
					console.error('[CueContainer] Error al guardar setlist:', res?.error);
				}
			},
		);
	}

	// Carga un setlist de DB al workingState local (NO aplica al servidor)
	function handleLoadSetlist(id) {
		socket.emit(EVENTS.CLIENT.FETCH_SETLIST_BY_ID, id, (res) => {
			if (!res?.ok) {
				console.error('[CueContainer] Error al cargar setlist:', res?.error);
				return;
			}
			// Reconciliar canciones de la DB con el songsCue actual usando el nombre
			// (Los IDs de Ableton cambian entre sesiones o recargas del proyecto)
			const abletonMap = new Map(songsCue.map((s) => [s.name, s]));
			const loaded = res.data
				.filter((row) => abletonMap.has(row.song_name))
				.map((row) => abletonMap.get(row.song_name));
			// Agregar al final canciones de Ableton que no estaban en el setlist guardado
			const loadedNames = new Set(res.data.map((r) => r.song_name));
			for (const song of songsCue) {
				if (!loadedNames.has(song.name)) loaded.push(song);
			}
			set(loaded);
			setShowLoadPanel(false);
		});
	}

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}>
				<SortableContext
					items={present.map((s) => s.id)}
					strategy={verticalListSortingStrategy}>
					{present.map((song, index) => (
						<DraggeableCard
							key={song.id}
							id={song.id}
							isActive={index === currentSong}>
							<span className='card-name'>{song.name}</span>
							<PlayAtArrow songIndex={index} />
						</DraggeableCard>
					))}
				</SortableContext>
			</DndContext>

			{/* ── Barra de historial (undo/redo) ── */}
			<div className='cue-history-bar'>
				<button className='btn-history' onClick={undo} disabled={!canUndo}>
					Deshacer
				</button>
				{isDirty && (
					<span
						className='cue-dirty-indicator'
						title='Hay cambios sin confirmar'>
						Draft
					</span>
				)}
				<button className='btn-history' onClick={redo} disabled={!canRedo}>
					Rehacer
				</button>
			</div>

			{/* ── Acciones principales ── */}
			<div className='cue-actions'>
				<button
					className='btn-reset'
					onClick={() => discardToRuntime(songsCue)}>
					Sincronizar
				</button>

				<button
					className='btn-set'
					disabled={!isDirty}
					onClick={handleConfirmApply}>
					Confirmar y Aplicar
				</button>

				<button
					className='btn-play-all'
					onClick={() => socket.emit(EVENTS.CLIENT.PLAY, 0)}>
					Play CUE
				</button>
			</div>

			{/* ── Acciones de persistencia ── */}
			<div className='cue-persist-actions'>
				<button className='btn-persist' onClick={() => setShowSaveModal(true)}>
					Guardar Setlist
				</button>
				<button
					className='btn-persist'
					onClick={() => setShowLoadPanel((v) => !v)}>
					Cargar Setlist
				</button>
			</div>

			{/* ── Panel de carga de setlists ── */}
			{showLoadPanel && (
				<div className='cue-load-panel'>
					<p className='load-panel-title'>Seleccionar Setlist Guardado</p>
					{setlists.length === 0 ? (
						<p className='load-panel-empty'>No hay setlists guardados.</p>
					) : (
						<ul className='load-panel-list'>
							{setlists.map((sl) => (
								<li key={sl.id} className='load-panel-item'>
									<span className='load-panel-name'>{sl.name}</span>
									<button
										className='btn-load-item'
										onClick={() => handleLoadSetlist(sl.id)}>
										Cargar
									</button>
								</li>
							))}
						</ul>
					)}
					<button
						className='btn-reset'
						style={{ marginTop: '6px', width: '100%' }}
						onClick={() => setShowLoadPanel(false)}>
						Cerrar
					</button>
				</div>
			)}

			{/* ── Modal guardar setlist ── */}
			{showSaveModal && (
				<div className='cue-save-modal-backdrop'>
					<div className='cue-save-modal'>
						<p className='save-modal-title'>Guardar Setlist</p>
						<input
							className='save-modal-input'
							type='text'
							placeholder='Nombre del setlist (opcional)'
							value={saveName}
							onChange={(e) => setSaveName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSaveSetlist()}
							autoFocus
						/>
						<div className='save-modal-actions'>
							<button
								className='btn-reset'
								onClick={() => {
									setShowSaveModal(false);
									setSaveName('');
								}}>
								Cancelar
							</button>
							<button className='btn-set' onClick={handleSaveSetlist}>
								Guardar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
