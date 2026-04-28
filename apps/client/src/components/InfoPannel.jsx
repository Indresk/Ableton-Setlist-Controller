import { useAbletonStore } from '../store/abletonStore';

export default function InfoPannel() {
	const tempo = useAbletonStore((s) => s.tempo);
	return (
		<div>
			<h2>Tempo: {tempo}</h2>
		</div>
	);
}
