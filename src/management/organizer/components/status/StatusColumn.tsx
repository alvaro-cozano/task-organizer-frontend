import React from 'react';
import { CardDTO, StatusDTO, CardItem } from '../../../../management';

interface StatusColumnProps {
  status: StatusDTO;
  cards: CardDTO[];
  onCardClick: (card: CardDTO) => void;
}

const StatusColumn: React.FC<StatusColumnProps> = ({ status, cards, onCardClick }) => (
  <div className="status-column p-4 rounded shadow-md bg-white w-64">
    <h3 className="text-lg font-semibold mb-3">{status.name}</h3>
    {cards.length === 0 ? (
      <p className="text-sm text-gray-500">No hay tarjetas en este estado.</p>
    ) : (
      cards.map((card) => (
        <CardItem key={card.id} card={card} onClick={onCardClick} />
      ))
    )}
  </div>
);

export default StatusColumn;
