export type Color = 'WHITE' | 'BLACK';
export type PieceType = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN';

export interface Position {
    x: number;
    y: number;
}

export interface SerializedPiece {
    type: PieceType;
    color: Color;
    has_moved: boolean; 
}

export interface Move {
    from: Position;
    to: Position;
    piece: PieceType;
    captured?: PieceType;
    moveNumber: number; 
    isCheck?: boolean;
    isCheckmate?: boolean;
    isCastle?: boolean;
    isEnPassant?: boolean;
    promotion?: PieceType;
    algebraicNotation?: string;
    timeSpent?: number; 
}

export interface GameState {
    gameId: string;
    boardState: (SerializedPiece | null)[][];
    currentPlayer: Color;
    gameStatus: string; 
    whitePlayer: string | null;
    blackPlayer: string | null;
    moveHistory: Move[];
    capturedPieces?: { piece: PieceType; capturedColor: Color }[];
    timeControl?: string;
    startedAt?: Date;
    updatedAt?: Date;
    winner?: string | null;
    looser?: string | null; 
}

export interface ChatMessage {
    playerId: string;
    message: string;
    timestamp: number;
}

export enum GameStatus {
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    CHECK = 'CHECK',
    CHECKMATE = 'CHECKMATE',
    STALEMATE = 'STALEMATE',
    DRAW = 'DRAW',
    ABANDONED = 'ABANDONED'
}

export interface CreateGameData {
    timeControl?: string;
    isRanked?: boolean;
}

export interface JoinGameData {
    gameId: string;
}

export interface MakeMoveData {
    from: Position;
    to: Position;
}

export interface GetValidMovesData {
    position: Position;
}

export interface ChatMessageData {
    message: string;
}

export interface User {
    id: string;
    username?: string;
    email?: string;
}

export interface UserSession {
    user: User;
    token?: string;
    expiresAt?: Date;
}