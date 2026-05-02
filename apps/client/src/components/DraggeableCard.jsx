import Card from './Card';
// import './Card.css';

export default function DraggeableCard({
	children,
	draggingFunctions,
	isActive,
}) {
	const { handleDragStart, handleDragOver, handleDrop, index, dragIndex } =
		draggingFunctions;
	return (
		<div
			className={`${index === dragIndex && 'dragging'} ${isActive && 'active'} draggeable`}
			draggable
			onDragStart={(e) => handleDragStart(index)}
			onDragOver={handleDragOver}
			onDrop={() => handleDrop(index)}>
			<Card>{children}</Card>
		</div>
	);
}
