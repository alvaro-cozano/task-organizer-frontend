import { ChecklistSubItemDTO } from "./ChecklistSubItemDTO";

export interface ChecklistItemDTO {
  id?: number;
  title: string;
  completed: boolean;
  cardId: number;
  subItems?: ChecklistSubItemDTO[];
}