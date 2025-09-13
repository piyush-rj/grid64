"use client";
import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { GameState, Move, Position, useChessStore } from "../store/useChessGameStore";
import { useUserSessionStore } from "../store/useUserSessionStore";
import { GameStatus } from "../types/web-socket-types";

export enum WebSocketMessageType {
    CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',
    PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',

    GAME_CREATED = 'GAME_CREATED',
    PLAYER_JOINED = 'PLAYER_JOINED',
    MOVE_MADE = 'MOVE_MADE',
    GAME_STATE = 'GAME_STATE',
    GAME_RESTORED = 'GAME_RESTORED',
    VALID_MOVES = 'VALID_MOVES',
    PLAYER_LEFT = 'PLAYER_LEFT',
    GAME_ENDED = 'GAME_ENDED',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    ERROR = 'ERROR',

    CREATE_GAME = 'CREATE_GAME',
    JOIN_GAME = 'JOIN_GAME',
    MAKE_MOVE = 'MAKE_MOVE',
    GET_VALID_MOVES = 'GET_VALID_MOVES',
    GET_GAME_STATE = 'GET_GAME_STATE',
    LEAVE_GAME = 'LEAVE_GAME',
}

interface BaseWebSocketMessage {
    type: WebSocketMessageType;
    timestamp?: number;
    messageId?: string;
}

interface ConnectionEstablishedMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.CONNECTION_ESTABLISHED;
    data: {
        playerId: string;
        timestamp: number;
    };
}

interface GameCreatedMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GAME_CREATED;
    data: {
        gameId: string;
        gameState: GameState;
    };
}

interface PlayerJoinedMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.PLAYER_JOINED;
    data: {
        playerId: string;
        gameState: GameState;
    };
}

interface MoveMadeMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.MOVE_MADE;
    data: {
        move: Move;
        gameState: GameState;
        playerId: string;
    };
}

interface GameStateMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GAME_STATE;
    data: {
        gameState: GameState;
    };
}

interface GameRestoredMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GAME_RESTORED;
    data: {
        gameState: GameState;
    };
}

interface ValidMovesMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.VALID_MOVES;
    data: {
        position: Position;
        validMoves: Position[];
    };
}

interface PlayerLeftMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.PLAYER_LEFT;
    data: {
        playerId: string;
        gameId?: string;
    };
}

interface GameEndedMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GAME_ENDED;
    data: {
        gameState: GameState;
        reason: GameStatus;
        winner?: string | null;
        looser?: string | null;
    };
}

interface ChatMessageReceived extends BaseWebSocketMessage {
    type: WebSocketMessageType.CHAT_MESSAGE;
    data: {
        playerId: string;
        message: string;
        timestamp: number;
    };
}

interface ErrorMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.ERROR;
    data: {
        error: string;
        timestamp: number;
    };
}

// Union type for all incoming messages
type IncomingWebSocketMessage =
    | ConnectionEstablishedMessage
    | GameCreatedMessage
    | PlayerJoinedMessage
    | MoveMadeMessage
    | GameStateMessage
    | GameRestoredMessage
    | ValidMovesMessage
    | PlayerLeftMessage
    | GameEndedMessage
    | ChatMessageReceived
    | ErrorMessage;

// Outgoing message types (to backend)
interface CreateGameMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.CREATE_GAME;
    data?: {
        timeControl?: string;
        isRanked?: boolean;
    };
}

interface JoinGameMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.JOIN_GAME;
    data: {
        gameId: string;
    };
}

interface MakeMoveMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.MAKE_MOVE;
    data: {
        from: Position;
        to: Position;
    };
}

interface GetValidMovesMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GET_VALID_MOVES;
    data: {
        position: Position;
    };
}

interface GetGameStateMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.GET_GAME_STATE;
    data?: object;
}

interface LeaveGameMessage extends BaseWebSocketMessage {
    type: WebSocketMessageType.LEAVE_GAME;
    data?: object;
}

interface ChatMessageSend extends BaseWebSocketMessage {
    type: WebSocketMessageType.CHAT_MESSAGE;
    data: {
        message: string;
    };
}

// Union type for all outgoing messages
type OutgoingWebSocketMessage =
    | CreateGameMessage
    | JoinGameMessage
    | MakeMoveMessage
    | GetValidMovesMessage
    | GetGameStateMessage
    | LeaveGameMessage
    | ChatMessageSend;

interface WebSocketContextType {
    ws: WebSocket | null;
    sendMessage: (message: OutgoingWebSocketMessage) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    ws: null,
    sendMessage: () => { },
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
    wsUrl?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children,
    wsUrl = "ws://localhost:8080",
}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    const { session } = useUserSessionStore();
    const playerId = session?.user?.id;

    const {
        setConnected,
        setConnecting,
        setGameState,
        setCurrentGameId,
        setPlayerColor,
        setValidMoves,
        addMessage,
        reset,
    } = useChessStore();

    const connect = (): void => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setConnecting(true);

        try {
            const ws = new WebSocket(`${wsUrl}?playerId=${playerId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
                setConnected(true);
                setConnecting(false);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event: MessageEvent) => {
                try {
                    const message: IncomingWebSocketMessage = JSON.parse(event.data);
                    handleMessage(message);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = (event: CloseEvent) => {
                console.log("WebSocket disconnected:", event.code, event.reason);
                setConnected(false);
                setConnecting(false);

                if (
                    event.code !== 1000 &&
                    reconnectAttemptsRef.current < maxReconnectAttempts
                ) {
                    const delay = Math.min(
                        1000 * Math.pow(2, reconnectAttemptsRef.current),
                        10000
                    );
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                }
            };

            ws.onerror = (error: Event) => {
                console.error("WebSocket error:", error);
                setConnecting(false);
            };
        } catch (error) {
            console.error("Error creating WebSocket connection:", error);
            setConnecting(false);
        }
    };

    const handleMessage = (message: IncomingWebSocketMessage): void => {
        console.log("Received message:", message);

        switch (message.type) {
            case WebSocketMessageType.CONNECTION_ESTABLISHED:
                console.log("Connection established for player:", message.data.playerId);
                break;

            case WebSocketMessageType.GAME_CREATED:
                setCurrentGameId(message.data.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case WebSocketMessageType.PLAYER_JOINED:
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case WebSocketMessageType.MOVE_MADE:
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                setValidMoves([]);
                break;

            case WebSocketMessageType.GAME_STATE:
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                break;

            case WebSocketMessageType.GAME_RESTORED:
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case WebSocketMessageType.VALID_MOVES:
                setValidMoves(message.data.validMoves || []);
                break;

            case WebSocketMessageType.PLAYER_LEFT:
                setGameState(null);
                setCurrentGameId(null);
                setPlayerColor(null);
                break;

            case WebSocketMessageType.CHAT_MESSAGE:
                addMessage({
                    playerId: message.data.playerId,
                    message: message.data.message,
                    timestamp: message.data.timestamp,
                });
                break;

            case WebSocketMessageType.GAME_ENDED:
                setGameState(message.data.gameState);
                break;

            case WebSocketMessageType.ERROR:
                console.error("Server error:", message.data.error);
                break;

            default:
                // TypeScript will ensure this is never reached if all cases are handled
                console.log("Unhandled message type:", (message as IncomingWebSocketMessage).type);
        }
    };

    const sendMessage = (message: OutgoingWebSocketMessage): void => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            console.log("Sent message:", message);
        } else {
            console.error("WebSocket is not connected");
        }
    };

    useEffect(() => {
        if (playerId) {
            connect();
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounting");
            }
            reset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerId]);

    if (!session) {
        return <>{children}</>;
    }

    return (
        <WebSocketContext.Provider value={{ ws: wsRef.current, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};