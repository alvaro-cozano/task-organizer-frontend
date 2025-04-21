export interface CardDTO {
  id?: number;
  cardTitle: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  board_id: number;
  status_id: number;
  prev_status_id?: number;
  users: { email: string }[];
}
