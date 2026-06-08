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
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);

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

	const isDirty =
		present !== songsCue &&
		JSON.stringify(present) !== JSON.stringify(songsCue);

	const prevSongsCue = useRef(songsCue);
	useEffect(() => {
		if (prevSongsCue.current !== songsCue) {
			prevSongsCue.current = songsCue;
			syncFromRuntime(songsCue);
		}
	}, [songsCue]);

	const [setlists, setSetlists] = useState([]);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [saveName, setSaveName] = useState('');
	const [showLoadPanel, setShowLoadPanel] = useState(false);

	useEffect(() => {
		if (showLoadPanel) {
			socket.emit(EVENTS.CLIENT.FETCH_SETLISTS, (res) => {
				if (res.ok) setSetlists(res.data);
			});
		}
	}, [showLoadPanel]);

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

	function handleDragEnd({ active, over }) {
		if (!over || active.id === over.id) return;
		const oldIndex = present.findIndex((s) => s.id === active.id);
		const newIndex = present.findIndex((s) => s.id === over.id);
		set(arrayMove(present, oldIndex, newIndex));
	}

	function handleConfirmApply() {
		socket.emit(EVENTS.CLIENT.SET_CUE, present, (res) => {
			if (!res?.ok)
				console.error('[CueContainer] Error al aplicar orden:', res?.error);
		});
	}

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

	function handleLoadSetlist(id) {
		socket.emit(EVENTS.CLIENT.FETCH_SETLIST_BY_ID, id, (res) => {
			if (!res?.ok) {
				console.error('[CueContainer] Error al cargar setlist:', res?.error);
				return;
			}

			const abletonMap = new Map(songsCue.map((s) => [s.name, s]));
			const loaded = res.data
				.filter((row) => abletonMap.has(row.song_name))
				.map((row) => abletonMap.get(row.song_name));

			const loadedNames = new Set(res.data.map((r) => r.song_name));
			for (const song of songsCue) {
				if (!loadedNames.has(song.name)) loaded.push(song);
			}
			set(loaded);
			setShowLoadPanel(false);
		});
	}

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
