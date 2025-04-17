import { useState } from 'react';
import { useBoardStore } from '../../../hooks/useBoardStore';
import { BoardModal } from './BoardModal';

export const FabAddBoard = () => {
    const { setActiveBoard } = useBoardStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setActiveBoard({ id: 0, boardName: '', users: [] });
        setIsOpen(true);
    };

    return (
        <>
            <button className="btn btn-primary fab" onClick={handleClick}>
                <i className="fas fa-plus" />
            </button>
            <BoardModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};
