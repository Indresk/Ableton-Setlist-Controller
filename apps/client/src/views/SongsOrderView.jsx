import TimeBar from '../components/TimeBar.jsx';
import { useAbletonStore } from '../store/abletonStore.js';

export default function SongOrderView() {
	const { songsCue } = useAbletonStore();
	return (
		<>
			{songsCue.map((song) => (
				<div key={song.id}>{song.name}</div>
			))}
			<TimeBar />
		</>
	);
}
