export type Color = 'WHITE' | 'BLACK';
export type PieceSymbol = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

export interface Position {
    x: number;
    y: number;
}

// Piece Types
export enum PieceTypeEnum {
    KING = 'KING',
    QUEEN = 'QUEEN',
    ROOK = 'ROOK',
    BISHOP = 'BISHOP',
    KNIGHT = 'KNIGHT',
    PAWN = 'PAWN'
}

// game status
export enum GameStatusEnum {
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    CHECK = 'CHECK',
    CHECKMATE = 'CHECKMATE',
    STALEMATE = 'STALEMATE',
    DRAW = 'DRAW',
    ABANDONED = 'ABANDONED'
}

// Move Interface
export interface Move {
    from: Position;
    to: Position;
    piece: PieceTypeEnum;
    captured?: PieceTypeEnum;
    moveNumber: number;
    isCheck?: boolean;
    isCheckmate?: boolean;
    isCastle?: boolean;
    isEnPassant?: boolean;
    promotion?: PieceTypeEnum;
    algebraicNotation?: string;
    timeSpent?: number;
}

export interface PlayerResult {
    playerId: string;
    color: Color;
}

export interface SerializedPiece {
    type: PieceTypeEnum;
    color: Color;
    has_moved: boolean;
}

export interface GameState {
    gameId: string;
    // board: any;
    boardState: (SerializedPiece | null)[][];
    currentPlayer: Color;
    gameStatus: GameStatusEnum;
    whitePlayer: string | null;
    blackPlayer: string | null;
    moveHistory: Move[];
    capturedPieces?: { piece: PieceTypeEnum; capturedColor: Color }[];
    timeControl?: string;
    startedAt?: Date;
    updatedAt?: Date;
}

export enum WebSocketMessageType {
    // connection events
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    PLAYER_CONNECTED = 'PLAYER_CONNECTED',
    PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',

    // game
    CREATE_GAME = 'CREATE_GAME',
    GAME_CREATED = 'GAME_CREATED',
    JOIN_GAME = 'JOIN_GAME',
    PLAYER_JOINED = 'PLAYER_JOINED',
    LEAVE_GAME = 'LEAVE_GAME',
    PLAYER_LEFT = 'PLAYER_LEFT',
    GAME_RESTORED = 'GAME_RESTORED',

    // game plays
    MAKE_MOVE = 'MAKE_MOVE',
    MOVE_MADE = 'MOVE_MADE',
    GET_VALID_MOVES = 'GET_VALID_MOVES',
    VALID_MOVES = 'VALID_MOVES',
    GET_GAME_STATE = 'GET_GAME_STATE',
    GAME_STATE = 'GAME_STATE',
    GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',

    // game end events
    GAME_ENDED = 'GAME_ENDED',
    CHECKMATE = 'CHECKMATE',
    STALEMATE = 'STALEMATE',
    DRAW = 'DRAW',

    // message event
    CHAT_MESSAGE = 'CHAT_MESSAGE',

    // system events
    ERROR = 'ERROR',
    HEARTBEAT = 'HEARTBEAT',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface WebSocketMessage {
    type: WebSocketMessageType;
    data: any;
    timestamp?: number;
    messageId?: string;
}

export interface CreateGameMessage {
    type: WebSocketMessageType.CREATE_GAME;
    data: {
        timeControl?: string;
        isRanked?: boolean;
    };
}

export interface JoinGameMessage {
    type: WebSocketMessageType.JOIN_GAME;
    data: {
        gameId: string;
    };
}

export interface MakeMoveMessage {
    type: WebSocketMessageType.MAKE_MOVE;
    data: {
        from: Position;
        to: Position;
    };
}

export interface GetValidMovesMessage {
    type: WebSocketMessageType.GET_VALID_MOVES;
    data: {
        position: Position;
    };
}

export interface ChatMessage {
    type: WebSocketMessageType.CHAT_MESSAGE;
    data: {
        message: string;
    };
}

// Response Message Types
export interface GameCreatedResponse {
    type: WebSocketMessageType.GAME_CREATED;
    data: {
        gameId: string;
        gameState: GameState;
        playerColor: Color;
    };
}

export interface PlayerJoinedResponse {
    type: WebSocketMessageType.PLAYER_JOINED;
    data: {
        playerId: string;
        gameState: GameState;
    };
}

export interface MoveMadeResponse {
    type: WebSocketMessageType.MOVE_MADE;
    data: {
        move: Move;
        gameState: GameState;
        playerId: string;
    };
}

export interface ValidMovesResponse {
    type: WebSocketMessageType.VALID_MOVES;
    data: {
        position: Position;
        validMoves: Position[];
    };
}

export interface GameStateResponse {
    type: WebSocketMessageType.GAME_STATE;
    data: {
        gameState: GameState;
    };
}

export interface GameEndedResponse {
    type: WebSocketMessageType.GAME_ENDED;
    data: {
        gameState: GameState;
        reason: GameStatusEnum;
        winner?: Color;
    };
}

export interface ErrorResponse {
    type: WebSocketMessageType.ERROR;
    data: {
        error: string;
        code?: string;
        timestamp: number;
    };
}

export interface ChatMessageResponse {
    type: WebSocketMessageType.CHAT_MESSAGE;
    data: {
        playerId: string;
        message: string;
        timestamp: number;
    };
}

// Utility Types for Game Manager
export interface GameCreationData {
    gameId: string;
    playerId: string;
    color: Color;
}

export interface PlayerJoinData {
    gameId: string;
    playerId: string;
    color: Color;
}

export interface MoveData {
    gameId: string;
    playerId: string;
    move: Move;
}

export interface GameEndData {
    gameId: string;
    status: GameStatusEnum;
    winner: Color | null;
}

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    messageType?: WebSocketMessageType;
}

export const CacheKeys = {
    GAME_STATE: (gameId: string) => `game:${gameId}`,
    PLAYER_GAME: (playerId: string) => `player:${playerId}:game`,
    GAME_PLAYERS: (gameId: string) => `game:${gameId}:players`,
    MATCHMAKING_QUEUE: 'matchmaking:queue',
    PLAYER_SESSION: (playerId: string) => `session:${playerId}`,
    RATE_LIMIT: (identifier: string) => `ratelimit:${identifier}`,
} as const;

// Redis Pub/Sub Channels
export const PubSubChannels = {
    GAME_UPDATES: (gameId: string) => `game:${gameId}:updates`,
    GLOBAL_EVENTS: 'chess:global:events',
    PLAYER_EVENTS: (playerId: string) => `player:${playerId}:events`,
} as const;

export type QueueEventType =
    | 'GAME_CREATION'
    | 'PLAYER_JOIN'
    | 'MOVE'
    | 'GAME_END'
    | 'GAME_UPDATE'
    | 'GAME_DELETION'
    | 'RATING_UPDATE';

export enum ConnectionState {
    CONNECTING = 'CONNECTING',
    OPEN = 'OPEN',
    CLOSING = 'CLOSING',
    CLOSED = 'CLOSED'
}

// Game Time Controls
export interface TimeControl {
    initialTime: number; // in seconds
    increment: number;   // in seconds per move
    name: string;        // e.g., "5+3", "10+0", "30+0"
}

export const StandardTimeControls: TimeControl[] = [
    { initialTime: 60, increment: 1, name: '1+1' },
    { initialTime: 180, increment: 2, name: '3+2' },
    { initialTime: 300, increment: 3, name: '5+3' },
    { initialTime: 600, increment: 0, name: '10+0' },
    { initialTime: 900, increment: 10, name: '15+10' },
    { initialTime: 1800, increment: 0, name: '30+0' }
];

export * from './web-socket-types';