import React from 'react';

import { differenceInHours, differenceInMinutes } from 'date-fns';

import { CardDTO } from '../../../../management';
import { useCardStore } from '../../../../hooks';

import '../../style/CardItem.css';

interface CardItemProps {
  card: CardDTO;
  onClick: (card: CardDTO) => void;
  onUpdate?: (updatedCard: CardDTO) => void;
  onDelete?: (cardId: number) => void;
}

interface UserWithProfileImage {
  email: string;
  profileImageBase64?: string;
}

function getProgress(card: CardDTO): number {
  if (card.finished) return 100;

  const checklist = card.checklistItems;
  if (!checklist || checklist.length === 0) {
    return 0;
  }

  let total = checklist.length;
  let completed = 0;

  checklist.forEach(item => {
    if (item.completed) {
      completed += 1;
    } else if (item.subItems && item.subItems.length > 0) {
      const subCompleted = item.subItems.filter(sub => sub.done).length;
      completed += subCompleted / item.subItems.length;
    }
  });

  return Math.round((completed / total) * 100);
}

export const CardItem: React.FC<CardItemProps> = ({ card, onClick }) => {
  const { startSavingCard } = useCardStore();

  const handleFinishedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    await startSavingCard({ ...card, finished: e.target.checked });
  };

  const calculateTimeLeft = () => {
    if (card.finished) {
      return new Date(card.endDate).toLocaleDateString();
    }
    const endDate = new Date(card.endDate);
    const today = new Date();

    if (endDate <= today) return 'Vencido';

    const hoursLeft = differenceInHours(endDate, today);
    const minutesLeft = differenceInMinutes(endDate, today) % 60;

    if (hoursLeft >= 24) {
      const daysLeft = Math.ceil(hoursLeft / 24);
      return `${daysLeft} día${daysLeft !== 1 ? 's' : ''}`;
    } else if (hoursLeft >= 1) {
      return `${hoursLeft} hora${hoursLeft !== 1 ? 's' : ''}`;
    } else {
      return `${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}`;
    }
  };

  const getCardColor = () => {
    return card.label?.color || '#222';
  };

  const getAccentColor = () => {
    return card.label?.color || '#fff';
  };

  const cardStyle = {
    background: card.label
      ? `radial-gradient(ellipse at right top, ${getCardColor()}33 0%, #151419 47%, #151419 100%)`
      : '#151515',
    borderColor: getCardColor(),
  };

  const progressFillStyle = {
    backgroundColor: getAccentColor(),
    width: `${getProgress(card)}%`
  };

  const hasProfileImage = (user: UserWithProfileImage): user is Required<UserWithProfileImage> => {
    return !!user.profileImageBase64;
  };

  return (
    <div className="pm-card-container" onClick={() => onClick(card)}>
      <div className="pm-card" style={cardStyle}>
        <div className="pm-card-body">
          <div className="pm-card-header-row">
            <input
              type="checkbox"
              className="pm-card-finished-checkbox"
              checked={card.finished}
              onChange={handleFinishedChange}
              style={{
                borderColor: getAccentColor(),
                ['--pm-check-color' as any]: getAccentColor()
              }}
              title="Marcar como completada"
              onClick={e => e.stopPropagation()}
            />
            <h3 className="pm-card-title">{card.cardTitle}</h3>
          </div>
          <div className="pm-card-progress">
            <div className="pm-progress-bar">
              <div 
                className="pm-progress-fill" 
                style={progressFillStyle}
              ></div>
            </div>
            <span className="pm-progress-percent">{getProgress(card)}%</span>
          </div>
        </div>
        
        <div className="pm-card-footer">
          <ul className="pm-user-list">
            {card.users?.slice(0, 3).map((user: UserWithProfileImage, index: number) => (
              <li key={index} className="pm-user-item">
                {hasProfileImage(user) ? (
                  <img 
                    className="pm-user-avatar"
                    src={`data:image/jpeg;base64,${user.profileImageBase64}`} 
                    alt={user.email}
                  />
                ) : (
                  <img 
                    className="pm-user-avatar"
                    src={`https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&background=random&color=fff`} 
                    alt={user.email}
                  />
                )}
              </li>
            ))}
            {card.users && card.users.length > 3 && (
              <li className="pm-more-users">+{card.users.length - 3}</li>
            )}
          </ul>

          <span
            className="pm-countdown-btn"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: getCardColor(),
              color: '#fff'
            }}
          >
            {calculateTimeLeft()}
          </span>
        </div>
      </div>
    </div>
  );
};