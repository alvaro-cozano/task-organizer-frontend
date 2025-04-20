import React from 'react';
import { BoardDTO } from '../../../../management';

interface BoardCardProps {
  board: BoardDTO;
  onClick: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  return (
    <div className="col-md-4 mb-3" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">{board.boardName}</h5>
        </div>
      </div>
    </div>
  );
};

export default BoardCard;
