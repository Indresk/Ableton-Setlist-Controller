import { useAbletonStore } from '../store/abletonStore.js';
import { useEffect, useState } from 'react';
import DraggeableCard from './DraggeableCard.jsx';
import { EVENTS } from '../../../../packages/shared/events.js';
import { socket } from '../socket/socket.js';
import PlayAtArrow from './PlayAtArrow.jsx';
export default function CueContainer() {
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);
	// const { songsCue, currentSong } = useAbletonStore();
	const [items, setItems] = useState(songsCue);
	const [dragIndex, setDragIndex] = useState(null);

	function handleDragStart(index) {
		setDragIndex(index);
	}

	function handleDragOver(e) {
		e.preventDefault();
	}

	const handleDrop = (index) => {
		const newItems = [...items];
		const draggedItem = newItems[dragIndex];
		newItems.splice(dragIndex, 1);

		newItems.splice(index, 0, draggedItem);
		setItems(newItems);
		setDragIndex(null);
	};

	useEffect(() => {
		setItems(songsCue);
	}, [songsCue]);
	return (
		<>
			{items.map((song, index) => (
				<DraggeableCard
					key={song.id}
					isActive={index === currentSong}
					draggingFunctions={{
						handleDragStart,
						handleDragOver,
						handleDrop,
						index,
						dragIndex,
					}}>
					{song.name}
					<PlayAtArrow songIndex={index} />
				</DraggeableCard>
			))}

			<button onClick={() => socket.emit(EVENTS.CLIENT.GET_CUE)}>RESET</button>

			<button
				disabled={songsCue === items}
				onClick={() => socket.emit(EVENTS.CLIENT.SET_CUE, items)}>
				SET
			</button>

			<button onClick={() => socket.emit(EVENTS.CLIENT.PLAY, 0)}>
				Play all cue
			</button>
		</>
	);
}
