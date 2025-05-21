export interface BoardDTO {
    id: number;
    boardName: string;
    users: { email: string }[];
    userBoardReference: {
        posX: number;
        posY: number;
        isAdmin: boolean;
      };
}