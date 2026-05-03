import ControlsBar from './components/ControlsBar';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import CurrentSongView from './views/CurrentSongView';
import SongOrderView from './views/SongsOrderView';
import SocketStatus from './components/SocketStatus';

function App() {
	const navigate = useNavigate();
	const location = useLocation();

	function handleNav() {
		if (location.pathname === '/') {
			navigate('/current-song');
			return;
		}
		navigate('/');
	}
	return (
		<>
			<button className='nav-arrow' onClick={handleNav}>
				Ir a{' '}
				{location.pathname === '/' ? 'canción actual' : 'todas las canciones'} →
			</button>
			<SocketStatus />
			<Routes>
				<Route path='/current-song' element={<CurrentSongView />} />
				<Route path='/' element={<SongOrderView />} />
			</Routes>
			<ControlsBar />
		</>
	);
}

export default App;
