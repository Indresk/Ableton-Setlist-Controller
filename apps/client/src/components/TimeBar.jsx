import { useAbletonStore } from '../store/abletonStore';
import './TimeBar.css';

export default function TimeBar() {
	const time = useAbletonStore((s) => s.time);
	const progress = (time / 200) * 100;
	return (
		<div className='time-bar-container'>
			<span className='time-bar' style={{ width: `${progress}%` }}>
				{time}
			</span>
		</div>
	);
}
