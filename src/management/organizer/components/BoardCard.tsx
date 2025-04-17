import { useBoardStore } from '../../../hooks/useBoardStore';

export interface UserReferenceDTO {
    email: string;
}

export interface BoardDTO {
    id: number;
    boardName: string;
    users: UserReferenceDTO[];
}

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
