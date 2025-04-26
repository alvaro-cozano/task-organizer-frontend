import React from 'react';
import { BoardDTO } from '../../../../management';

interface BoardCardProps {
  board: BoardDTO;
  onClick: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full h-full p-1 flex flex-col justify-center items-center bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
    >
      <h5 className="text-lg font-semibold text-center">{board.boardName}</h5>
    </div>
  );
};

export default BoardCard;
