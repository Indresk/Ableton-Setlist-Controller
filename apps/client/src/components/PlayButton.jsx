import './PlayButton.css';

export default function PlayButton({ behavior, state, onClick }) {
	return (
		<button onClick={onClick} className={`${behavior} ${state && 'active'}`}>
			{behavior}
		</button>
	);
}
