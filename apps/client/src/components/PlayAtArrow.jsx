import { EVENTS } from '../../../../packages/shared/events.js';
import { socket } from '../socket/socket';

export default function PlayAtArrow({ songIndex, sectionIndex = 0 }) {
	return (
		<button
			onClick={() =>
				socket.emit(EVENTS.CLIENT.PLAY, [songIndex, sectionIndex])
			}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width={24}
				height={24}
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth={1.5}
				strokeLinecap='round'
				strokeLinejoin='round'
				className=''>
				<path stroke='none' d='M0 0h24v24H0z' fill='none' />
				<path d='M20 12l-10 0' />
				<path d='M20 12l-4 4' />
				<path d='M20 12l-4 -4' />
				<path d='M4 4l0 16' />
			</svg>
		</button>
	);
}
