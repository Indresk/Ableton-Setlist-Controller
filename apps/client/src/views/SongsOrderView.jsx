import { EVENTS } from '../../../../packages/shared/events.js';
import CueContainer from '../components/CueContainer.jsx';
import TimeBar from '../components/TimeBar.jsx';
import { socket } from '../socket/socket.js';
import { useAbletonStore } from '../store/abletonStore.js';
import './SongsOrderView.css';

export default function SongOrderView() {
	return (
		<>
			<div className='songs-order-view-container'>
				<CueContainer />
			</div>

			{/* <TimeBar /> */}
		</>
	);
}
