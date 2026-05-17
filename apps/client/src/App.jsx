import ControlsBar from './components/ControlsBar';
import { Routes, Route } from 'react-router';
import CurrentSongView from './views/CurrentSongView';
import SongOrderView from './views/SongsOrderView';
import Header from './components/Header';
import './App.css';

function App() {
	return (
		<div className='main-container'>
			<Header />
			<div className='views-container'>
				<Routes>
					<Route path='/current-song' element={<CurrentSongView />} />
					<Route path='/' element={<SongOrderView />} />
				</Routes>
			</div>
			<ControlsBar />
		</div>
	);
}

export default App;
