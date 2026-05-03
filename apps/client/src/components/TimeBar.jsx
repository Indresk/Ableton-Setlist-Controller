import { useAbletonStore } from '../store/abletonStore';
import './TimeBar.css';

function formatTime(timeWithFloat) {
	const timeFixed = Math.round(timeWithFloat);
	return `${String(timeFixed).padStart(3, '0')}`;
}

export default function TimeBar() {
	const time = useAbletonStore((s) => s.time);
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);

	const song = songsCue[currentSong];
	const start = song?.start ?? 0;
	const duration = song ? song.end - song.start : 1;
	const elapsed = Math.max(0, time - start);
	const progress = Math.min(100, (elapsed / duration) * 100);

	return (
		<div className='time-bar-wrapper'>
			<div className='time-bar-container'>
				<span className='time-bar' style={{ width: `${progress}%` }} />
			</div>
			<span className='time-bar-label'>
				{formatTime(elapsed)}/{duration} BEATS
			</span>
		</div>
	);
}
