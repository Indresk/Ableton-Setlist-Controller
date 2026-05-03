import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Card.css';

function GripIcon() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={14}
			height={14}
			viewBox='0 0 24 24'
			fill='currentColor'
			aria-hidden='true'>
			<circle cx='9' cy='5' r='2' />
			<circle cx='15' cy='5' r='2' />
			<circle cx='9' cy='12' r='2' />
			<circle cx='15' cy='12' r='2' />
			<circle cx='9' cy='19' r='2' />
			<circle cx='15' cy='19' r='2' />
		</svg>
	);
}

export default function DraggeableCard({ id, children, isActive }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`draggeable${isActive ? ' active' : ''}${isDragging ? ' dragging' : ''}`}>
			<div className='card'>
				<span
					className='drag-handle'
					{...attributes}
					{...listeners}
					aria-label='Arrastrar para reordenar'>
					<GripIcon />
				</span>
				{children}
			</div>
		</div>
	);
}
