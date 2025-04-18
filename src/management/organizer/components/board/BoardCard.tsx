import { useBoardStore } from '../../../../hooks/useBoardStore';
import { BoardDTO } from '../../types/BoardDTO';

interface Props {
    board: BoardDTO;
}

export const BoardCard = ({ board }: Props) => {
    const { setActiveBoard } = useBoardStore();

    const handleMouseDown = () => {
        setActiveBoard(board);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            className="card p-3 shadow-sm rounded"
            style={{ width: '200px', cursor: 'pointer' }}
        >
            <h5 className="text-center">{board.boardName}</h5>
        </div>
    );
};
