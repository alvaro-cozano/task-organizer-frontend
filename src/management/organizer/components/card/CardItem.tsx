import React from 'react';
import { CardDTO } from '../../../../management';

interface CardItemProps {
  card: CardDTO;
  onClick: (card: CardDTO) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onClick }) => {
  return (
    <div
      onClick={() => onClick(card)}
      className="cursor-pointer p-2 border rounded mb-2 hover:bg-gray-100"
    >
      <div className="font-semibold">{card.cardTitle}</div>
      <div className="text-sm text-gray-600">
        {card.users.map(user => user.email).join(', ')}
      </div>
    </div>
  );
};
