import { ChecklistItemDTO } from "./ChecklistItemDTO";
import { LabelDTO } from "./LabelDTO";
import { UserDTO } from "./UserDTO";

export interface CardDTO {
  id: number;
  cardTitle: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  position: number;
  finished: boolean;
  board_id: number;
  attachedLinks: string;
  status_id: number;
  prev_status_id?: number;
  users?: UserDTO[],
  checklistItems?: ChecklistItemDTO[];
  label?: LabelDTO | null;
}
