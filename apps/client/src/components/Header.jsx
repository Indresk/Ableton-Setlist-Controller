import { useLocation, useNavigate } from 'react-router';
import SocketStatus from './SocketStatus';
import { socket } from '../socket/socket';
import { EVENTS } from '../../../../packages/shared/events';
import './Header.css';
import { useSocketStore } from '../store/socketStore';

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const status = useSocketStore((s) => s.isConnected);

	function handleNav() {
		if (location.pathname === '/') {
			navigate('/current-song');
			return;
		}
		navigate('/');
	}

	return (
		<div className='header-container'>
			<div className='status-container' style={{ flexDirection: 'column' }}>
				<div className='status-container'>
					<p>STATUS: </p>
					<SocketStatus />
				</div>
				{!status && (
					<button className='reconnect-button' onClick={() => socket.connect()}>
						RECONNECT
					</button>
				)}
			</div>

			<button
				className='nav-arrow'
				onClick={() => socket.emit(EVENTS.CLIENT.REFRESH)}>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width={24}
					height={24}
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth={2}
					strokeLinecap='round'
					strokeLinejoin='round'>
					<path stroke='none' d='M0 0h24v24H0z' fill='none' />
					<path d='M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4' />
					<path d='M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4' />
				</svg>
			</button>

			<button className='nav-arrow' onClick={handleNav}>
				{location.pathname === '/' ? 'Current Song' : 'All Songs'} →
			</button>
		</div>
	);
}
