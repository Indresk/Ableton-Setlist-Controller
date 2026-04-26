import { useState } from 'react';
import Test from './components/Test';

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<Test />
			<button
				className='counter'
				onClick={() => setCount((count) => count + 1)}>
				Count is {count}
			</button>
		</>
	);
}

export default App;
