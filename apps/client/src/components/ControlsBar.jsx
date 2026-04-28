import { socket } from '../socket/socket.js';
import { useAbletonStore } from '../store/abletonStore.js';
import { EVENTS } from '../../../../packages/shared/events.js';
import PlayButton from './PlayButton.jsx';
import './ControlBar.css';
import InfoPannel from './InfoPannel.jsx';

export default function ControlsBar() {
	const isPlaying = useAbletonStore((s) => s.isPlaying);

	return (
		<div className='control-bar'>
			<InfoPannel />

			<PlayButton
				onClick={() => socket.emit(EVENTS.CLIENT.PLAY)}
				behavior='play'
				state={isPlaying}
			/>
			<PlayButton
				onClick={() => socket.emit(EVENTS.CLIENT.STOP)}
				behavior='stop'
			/>
		</div>
	);
}
