"use client";
import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useChessStore } from "../store/useChessGameStore";
import { useUserSessionStore } from "../store/useUserSessionStore";

interface WebSocketContextType {
    ws: WebSocket | null;
    sendMessage: (message: any) => void;
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

    const connect = () => {
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

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleMessage(message);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = (event) => {
                console.log("WebSocket disconnected:", event.code, event.reason);
                setConnected(false);
                setConnecting(false);

                // Try reconnecting (if not normal close)
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

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setConnecting(false);
            };
        } catch (error) {
            console.error("Error creating WebSocket connection:", error);
            setConnecting(false);
        }
    };

    const handleMessage = (message: any) => {
        console.log("Received message:", message);

        switch (message.type) {
            case "CONNECTION_ESTABLISHED":
                console.log("Connection established for player:", message.data.playerId);
                break;

            case "GAME_CREATED":
                setCurrentGameId(message.data.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case "PLAYER_JOINED":
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case "MOVE_MADE":
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                setValidMoves([]);
                break;

            case "GAME_STATE":
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                break;

            case "GAME_RESTORED":
                setCurrentGameId(message.data.gameState.gameId);
                setGameState(message.data.gameState);
                if (message.data.gameState.whitePlayer === playerId) {
                    setPlayerColor("WHITE");
                } else if (message.data.gameState.blackPlayer === playerId) {
                    setPlayerColor("BLACK");
                }
                break;

            case "VALID_MOVES":   // ✅ handle this from server
                setValidMoves(message.data.validMoves || []);
                break;

            case "PLAYER_LEFT":
                setGameState(null);
                setCurrentGameId(null);
                setPlayerColor(null);
                break;

            case "CHAT_MESSAGE":
                addMessage({
                    playerId: message.data.playerId,
                    message: message.data.message,
                    timestamp: message.data.timestamp,
                });
                break;

            case "GAME_ENDED":
                setGameState(message.data.gameState);
                break;

            case "ERROR":
                console.error("Server error:", message.data.error);
                break;

            default:
                console.log("Unhandled message type:", message.type);
        }
    };


    const sendMessage = (message: any) => {
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
    }, [playerId]);

    if (!session) {
        return <>{children}</>; // ✅ always return JSX
    }

    return (
        <WebSocketContext.Provider value={{ ws: wsRef.current, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
