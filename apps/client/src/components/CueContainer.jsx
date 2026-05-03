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
import { useEffect, useState } from 'react';
import DraggeableCard from './DraggeableCard.jsx';
import { EVENTS } from '../../../../packages/shared/events.js';
import { socket } from '../socket/socket.js';
import PlayAtArrow from './PlayAtArrow.jsx';
import './CueContainer.css';

export default function CueContainer() {
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);
	const [items, setItems] = useState(songsCue);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(TouchSensor, {
			// 250ms de hold antes de activar el drag — evita conflictos con el scroll
			activationConstraint: { delay: 250, tolerance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd({ active, over }) {
		if (!over || active.id === over.id) return;
		setItems((prev) => {
			const oldIndex = prev.findIndex((s) => s.id === active.id);
			const newIndex = prev.findIndex((s) => s.id === over.id);
			return arrayMove(prev, oldIndex, newIndex);
		});
	}

	useEffect(() => {
		setItems(songsCue);
	}, [songsCue]);

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}>
				<SortableContext
					items={items.map((s) => s.id)}
					strategy={verticalListSortingStrategy}>
					{items.map((song, index) => (
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

			<div className='cue-actions'>
				<button
					className='btn-reset'
					onClick={() => socket.emit(EVENTS.CLIENT.GET_CUE)}>
					Reset
				</button>
				<button
					className='btn-set'
					disabled={songsCue === items}
					onClick={() => socket.emit(EVENTS.CLIENT.SET_CUE, items)}>
					Guardar orden
				</button>
				<button
					className='btn-play-all'
					onClick={() => socket.emit(EVENTS.CLIENT.PLAY, 0)}>
					Play CUE
				</button>
			</div>
		</>
	);
}
