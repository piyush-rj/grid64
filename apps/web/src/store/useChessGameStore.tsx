import { create } from 'zustand';

export type Color = 'WHITE' | 'BLACK';
export type PieceTypeEnum = 'KING' | 'QUEEN' | 'ROOK' | 'BISHOP' | 'KNIGHT' | 'PAWN';
export type GameStatusEnum = 'WAITING' | 'ACTIVE' | 'CHECK' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'ABANDONED';

export interface Position {
    x: number;
    y: number;
}

export interface SerializedPiece {
    type: PieceTypeEnum;
    color: Color;
    has_moved: boolean;
}

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

export interface GameState {
    gameId: string;
    boardState: (SerializedPiece | null)[][];
    currentPlayer: Color;
    gameStatus: GameStatusEnum;
    whitePlayer: string | null;
    blackPlayer: string | null;
    moveHistory: Move[];
    capturedPieces?: { piece: PieceTypeEnum; capturedColor: Color }[];
}

export interface ChessStore {
    connected: boolean;
    connecting: boolean;

    gameState: GameState | null;
    currentGameId: string | null;
    playerColor: Color | null;
    validMoves: Position[];
    selectedSquare: Position | null;
    messages: Array<{ playerId: string; message: string; timestamp: number }>;

    setConnected: (connected: boolean) => void;
    setConnecting: (connecting: boolean) => void;
    setGameState: (gameState: GameState | null) => void;
    setCurrentGameId: (gameId: string | null) => void;
    setPlayerColor: (color: Color | null) => void;
    setValidMoves: (moves: Position[]) => void;
    setSelectedSquare: (square: Position | null) => void;
    addMessage: (message: { playerId: string; message: string; timestamp: number }) => void;
    reset: () => void;
}

export const useChessStore = create<ChessStore>((set) => ({
    connected: false,
    connecting: false,
    gameState: null,
    currentGameId: null,
    playerColor: null,
    validMoves: [],
    selectedSquare: null,
    messages: [],

    setConnected: (connected) => set({ connected }),
    setConnecting: (connecting) => set({ connecting }),
    setGameState: (gameState) => set({ gameState }),
    setCurrentGameId: (gameId) => set({ currentGameId: gameId }),
    setPlayerColor: (color) => set({ playerColor: color }),
    setValidMoves: (moves) => set({ validMoves: moves }),
    setSelectedSquare: (square) => set({ selectedSquare: square }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    reset: () => set({
        connected: false,
        connecting: false,
        gameState: null,
        currentGameId: null,
        playerColor: null,
        validMoves: [],
        selectedSquare: null,
        messages: []
    })
}));