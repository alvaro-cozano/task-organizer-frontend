import React from 'react';
import { CardDTO } from '../../types/CardDTO';
import { StatusDTO } from '../../types/StatusDTO';

interface StatusColumnProps {
  statusName: string;
  cards: CardDTO[];
  onCardClick: (card: CardDTO) => void; // Asegúrate de que se pase la función correctamente
  status: StatusDTO | null;
  onEditStatus: () => void; // Función para editar el estado
}

const StatusColumn: React.FC<StatusColumnProps> = ({ statusName, cards, onCardClick }) => {
  return (
    <div className="status-column">
      <h3>{statusName}</h3>
      <ul>
        {cards.length > 0 ? (
          cards.map((card) => (
            <li key={card.id} onClick={() => onCardClick(card)}>
              {card.cardTitle} {/* Título de la tarjeta */}
            </li>
          ))
        ) : (
          <p>No hay tarjetas en este estado.</p> // Mensaje en caso de que no haya tarjetas
        )}
      </ul>
    </div>
  );
};

export default StatusColumn;
