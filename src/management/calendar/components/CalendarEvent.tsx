import { CardDTO, BoardDTO } from '../../../management';

interface CalendarEventProps {
  card: CardDTO;
  board: BoardDTO;
  bgColor: string;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ card, board, bgColor }) => (
  <div
    style={{
      color: '#fff',
      borderRadius: 12,
      padding: '0.5em 1em',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      background: bgColor,
      border: 'none',
      boxShadow: 'none', 
    }}
  >
    <span>{card.cardTitle}</span>
    <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.95 }}>
      {board.boardName ? `(${board.boardName})` : `(Tablero ${card.board_id})`}
    </span>
  </div>
);