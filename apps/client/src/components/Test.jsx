import { socket } from '../socket/socket.js';
import { useAbletonStore } from '../store/abletonStore.js';
import { EVENTS } from '../../../../packages/shared/events.js';

export default function Test() {
	const { isPlaying, tempo } = useAbletonStore();

	return (
		<div>
			<h2>Tempo: {tempo}</h2>
			<button onClick={() => socket.emit(EVENTS.CLIENT.PLAY)}>Play</button>
			<button onClick={() => socket.emit(EVENTS.CLIENT.STOP)}>Stop</button>
		</div>
	);
}
