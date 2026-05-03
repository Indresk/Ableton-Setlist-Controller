import { useAbletonStore } from '../store/abletonStore';

export default function InfoPannel() {
	const tempo = useAbletonStore((s) => s.tempo);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				lineHeight: 1,
			}}>
			<span
				style={{
					fontSize: '1.6rem',
					fontWeight: 700,
					color: 'var(--color-text)',
					letterSpacing: '-0.02em',
				}}>
				{Math.round(tempo)}
			</span>
			<span
				style={{
					fontSize: '0.6rem',
					fontWeight: 600,
					color: 'var(--color-text-muted)',
					letterSpacing: '0.1em',
					textTransform: 'uppercase',
					marginTop: '2px',
				}}>
				BPM
			</span>
		</div>
	);
}
