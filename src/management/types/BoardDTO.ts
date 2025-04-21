export interface BoardDTO {
    id: number;
    boardName: string;
    users: { email: string }[];
}