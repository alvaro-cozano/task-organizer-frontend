import React from 'react';
import { CardDTO } from '../../types/CardDTO'; // Asegúrate de que la ruta sea correcta

interface CardItemProps {
    card: CardDTO;
  }
  
  const CardItem: React.FC<CardItemProps> = ({ card }) => {
    return (
      <div className="list-group-item list-group-item-action">
        <h6>{card.cardTitle}</h6>
        <p>{card.description}</p>
        {/* Aquí puedes agregar más detalles de la tarjeta */}
      </div>
    );
  };
  
  export default CardItem;