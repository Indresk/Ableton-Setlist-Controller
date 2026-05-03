import { useSocketStore } from '../store/socketStore';
import './SocketStatus.css';

export default function SocketStatus() {
	const status = useSocketStore((s) => s.isConnected);

	return (
		<span className={`dot-status ${status ? 'active' : 'inactive'}`}></span>
	);
}
