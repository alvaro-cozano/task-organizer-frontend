import { useEffect, useState } from 'react';
import { Calendar } from 'react-big-calendar';

import { Navbar, CardDTO, CardModal, StatusDTO, CardItem } from "../../../management";
import { getMessagesES, localizer } from '../../../helpers';
import { useCardStore } from '../../../hooks';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const CalendarPage = () => {
  const { cards, setActiveCard, startLoadingMyCards } = useCardStore();
  const [lastView, setLastView] = useState<string>(localStorage.getItem('lastView') || 'month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<CardDTO | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusDTO[]>([]);

  useEffect(() => {
    startLoadingMyCards();
  }, []);

  const onDoubleClick = (card: CardDTO) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const onSelect = (card: CardDTO) => {
    setActiveCard(card);
  };

  const onViewChanged = (newView: string) => {
    setLastView(newView);
    localStorage.setItem('lastView', newView);
  };
  
  const transformCardsToEvents = () => {
    return cards.map((card) => ({
      ...card,
      start: new Date(card.startDate),
      end: new Date(card.endDate),
    }));
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid" style={{ paddingTop: '80px', height: 'calc(100vh - 80px)' }}>
        <Calendar
          culture="es"
          localizer={localizer}
          defaultView={lastView}
          events={transformCardsToEvents()}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 80px)' }}
          messages={getMessagesES()}

          view={lastView}
          date={currentDate}

          onNavigate={(date: Date) => setCurrentDate(date)}

          components={{
            event: ({ event }: { event: CardDTO }) => (
              <CardItem card={event} onClick={() => onDoubleClick(event)} />
            ),
          }}
          
          onDoubleClickEvent={onDoubleClick}
          onSelectEvent={onSelect}
          onView={onViewChanged}
        />

        {isCardModalOpen && selectedCard && (
          <CardModal
            isOpen={isCardModalOpen}
            closeModal={() => setIsCardModalOpen(false)}
            card={selectedCard}
            statuses={statuses}
          />
        )}
      </div>
    </>
  );
};

export default CalendarPage;
