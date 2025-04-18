export interface CardDTO {
  id?: number;
  cardTitle: string;  // Debería ser cardTitle y no title
  description?: string;
  startDate: string;
  endDate: string;
  priority: number;
  board_id: number;
  status_id: number;  // Debe ser statusId, no status
  prev_status_id?: number;
  users: { email: string }[];
}
