import Card from '../components/Card.jsx';
import PlayAtArrow from '../components/PlayAtArrow.jsx';
import TimeBar from '../components/TimeBar.jsx';
import { useAbletonStore } from '../store/abletonStore.js';
import './CurrentSongView.css';

export default function CurrentSongView() {
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);
	const currentSection = useAbletonStore((s) => s.currentSection);

	const currentSongInfo = songsCue[currentSong];
	const sections = currentSongInfo?.sections;

	if (!currentSongInfo)
		return <p className='no-song'>No hay canción seleccionada</p>;

	return (
		<div className='current-song-view'>
			<h1 className='current-song-title'>{currentSongInfo.name}</h1>
			<TimeBar />
			{sections.map((section, index) => (
				<div
					key={section.id}
					className={`section-row${currentSection === index ? ' active' : ''}`}>
					<Card>
						<span className='card-name'>{section.name}</span>
						<PlayAtArrow songIndex={currentSong} sectionIndex={index} />
					</Card>
				</div>
			))}
		</div>
	);
}
