import Card from '../components/Card.jsx';
import PlayAtArrow from '../components/PlayAtArrow.jsx';
import { useAbletonStore } from '../store/abletonStore.js';

export default function CurrentSongView() {
	const songsCue = useAbletonStore((s) => s.songsCue);
	const currentSong = useAbletonStore((s) => s.currentSong);
	const currentSection = useAbletonStore((s) => s.currentSection);

	const currentSongInfo = songsCue[currentSong];
	const sections = currentSongInfo?.sections;

	if (currentSong === null) return <h1>No song selected</h1>;

	return (
		<>
			<h1>{currentSongInfo.name}</h1>
			{sections.map((section, index) => (
				<div
					key={section.id}
					className={currentSection === index ? 'active' : undefined}>
					<Card>
						{section.name}
						<PlayAtArrow songIndex={currentSong} sectionIndex={index} />
					</Card>
				</div>
			))}
		</>
	);
}
