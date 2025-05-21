import { useEffect, useState, useMemo, useRef } from 'react';

import { Calendar } from 'react-big-calendar';
import FilterListIcon from '@mui/icons-material/FilterList';

import { Navbar, CardDTO, BoardDTO, CalendarEvent } from "../../../management";
import { getMessagesES, localizer } from '../../../helpers';
import { useCardStore, useBoardStore } from '../../../hooks';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const BOARD_COLORS = [
  '#2196f3', // azul
  '#9c27b0', // púrpura
  '#00e676', // verde
  '#f44336', // rojo
  '#ff9800', // naranja
  '#ff4081', // rosa
  '#673ab7', // índigo
  '#4caf50', // verde
  '#03a9f4', // celeste
  '#cddc39', // lima
];

const CalendarPage = () => {
  const { cards, setActiveCard, startLoadingMyCards } = useCardStore();
  const { boards, startLoadingBoards } = useBoardStore();
  const [lastView, setLastView] = useState<string>(localStorage.getItem('lastView') || 'month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBoards, setSelectedBoards] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startLoadingMyCards();
    startLoadingBoards();
  }, []);

  useEffect(() => {
    if (boards.length > 0) {
      setSelectedBoards(boards.map(b => b.id));
    }
  }, [boards]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const onSelect = (card: CardDTO) => setActiveCard(card);

  const onViewChanged = (newView: string) => {
    setLastView(newView);
    localStorage.setItem('lastView', newView);
  };

  const transformCardsToEvents = () => {
    const filteredCards = selectedBoards.length === 0
      ? []
      : cards.filter(card => selectedBoards.includes(Number(card.board_id)));
    return filteredCards.map((card) => ({
      ...card,
      start: new Date(card.startDate),
      end: new Date(card.endDate),
    }));
  };

  const boardColorMap = useMemo(() => {
    const map: { [key: number]: string } = {};
    let colorIdx = 0;
    boards.forEach(board => {
      if (!map[board.id]) {
        let assignedColor = BOARD_COLORS.find(
          c => !Object.values(map).includes(c)
        );
        if (!assignedColor) assignedColor = BOARD_COLORS[colorIdx % BOARD_COLORS.length];
        map[board.id] = assignedColor;
        colorIdx++;
      }
    });
    return map;
  }, [boards]);

  return (
    <>
      <Navbar />
      <div className="container-fluid" style={{ paddingTop: '80px', height: 'calc(100vh - 80px)', position: 'relative' }}>
        <div style={{ position: 'fixed', bottom: 15, right: 15, zIndex: 200 }}>
          <button
            onMouseDown={e => {
              e.stopPropagation();
              setMenuOpen(open => !open);
            }}
            style={{
              background: '#999',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '0.5em 1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <FilterListIcon />
          </button>
          {menuOpen && (
            <div
              ref={menuRef}
              style={{
                position: 'absolute',
                bottom: '110%',
                right: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: '1em',
                zIndex: 300,
                minWidth: 200
              }}
            >
              {boards.map(board => (
                <label key={board.id} style={{ display: 'block', marginBottom: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedBoards.includes(board.id)}
                    onChange={() => {
                      setSelectedBoards(prev =>
                        prev.includes(board.id)
                          ? prev.filter(id => id !== board.id)
                          : [...prev, board.id]
                      );
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>{board.boardName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
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
          eventPropGetter={() => ({
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              color: 'inherit',
              padding: 0,
              margin: 0,
              minHeight: '100%',
              alignItems: 'center',
            }
          })}
          components={{
            event: ({ event }: { event: CardDTO }) => {
              const board = boards.find((b: BoardDTO) => Number(b.id) === Number(event.board_id));
              const safeBoard: BoardDTO = board ?? {
                id: event.board_id,
                boardName: `Tablero ${event.board_id}`,
                users: [],
                userBoardReference: { posX: 0, posY: 0, isAdmin: false }
              };
              const bgColor = boardColorMap[safeBoard.id] || '#2196f3';
              return <CalendarEvent card={event} board={safeBoard} bgColor={bgColor} />;
            }
          }}
          onSelectEvent={onSelect}
          onView={onViewChanged}
        />
      </div>
    </>
  );
};

export default CalendarPage;