export type Color = 'WHITE' | 'BLACK';
export type PieceType = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN';

export interface Position {
    x: number;
    y: number;
}

export interface SerializedPiece {
    type: PieceType;
    color: Color;
    hasMoved: boolean;
}

export interface Move {
    from: Position;
    to: Position;
    piece: PieceType;
    captured?: PieceType;
    moveNumber?: number;
    isCheck?: boolean;
    isCheckmate?: boolean;
    isCastle?: boolean;
    isEnPassant?: boolean;
    promotion?: PieceType;
    algebraicNotation?: string;
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
}

export enum IncomingMessageType {
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    GAME_CREATED = 'GAME_CREATED',
    GAME_JOINED = 'GAME_JOINED',
    PLAYER_JOINED = 'PLAYER_JOINED',
    MOVE_MADE = 'MOVE_MADE',
    GAME_STATE = 'GAME_STATE',
    GAME_ENDED = 'GAME_ENDED',
    INVALID_MOVE = 'INVALID_MOVE',
    MOVE_FAILED = 'MOVE_FAILED',
    GAME_RESTORED = 'GAME_RESTORED',
}

export enum WebSocketSendMessage {
    CREATE_GAME = 'CREATE_GAME',
    JOIN_GAME = 'JOIN_GAME',
    LEAVE_GAME = 'LEAVE_GAME',
    MAKE_MOVE = 'MAKE_MOVE',
    RESIGN_GAME = 'RESIGN_GAME',
}
