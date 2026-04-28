import ControlsBar from './components/ControlsBar';
import { Routes, Route } from 'react-router';
import CurrentSongView from './views/CurrentSongView';
import SongOrderView from './views/SongsOrderView';

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<CurrentSongView />} />
				<Route path='/order' element={<SongOrderView />} />
			</Routes>
			<ControlsBar />
		</>
	);
}

export default App;
