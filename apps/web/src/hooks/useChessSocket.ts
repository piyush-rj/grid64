import { useCallback } from 'react';
import { useChessStore } from '../store/useChessGameStore';
import { useWebSocket } from '../provider/WebSocketProvider';
import { Position } from '../types/web-socket-types';

export const useChessSocket = () => {
    const { sendMessage } = useWebSocket();
    const {
        connected,
        connecting,
        gameState,
        currentGameId,
        playerColor,
        validMoves,
        selectedSquare,
        messages,
        setValidMoves,
        setSelectedSquare
    } = useChessStore();

    const createGame = useCallback(() => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        sendMessage({
            type: 'CREATE_GAME',
            data: {}
        });
    }, [connected, sendMessage]);

    const joinGame = useCallback((gameId: string) => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        sendMessage({
            type: 'JOIN_GAME',
            data: { gameId }
        });
    }, [connected, sendMessage]);

    const makeMove = useCallback((from: Position, to: Position) => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        if (!currentGameId) {
            console.error('Not in a game');
            return;
        }

        sendMessage({
            type: 'MAKE_MOVE',
            data: { from, to }
        });
    }, [connected, sendMessage, currentGameId]);

    const getValidMoves = useCallback((position: Position) => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        if (!currentGameId) {
            console.error('Not in a game');
            return;
        }

        sendMessage({
            type: 'GET_VALID_MOVES',
            data: { position }
        });
    }, [connected, sendMessage, currentGameId]);

    const leaveGame = useCallback(() => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        sendMessage({
            type: 'LEAVE_GAME',
            data: {}
        });
    }, [connected, sendMessage]);

    const sendChatMessage = useCallback((message: string) => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        if (!currentGameId) {
            console.error('Not in a game');
            return;
        }

        sendMessage({
            type: 'CHAT_MESSAGE',
            data: { message }
        });
    }, [connected, sendMessage, currentGameId]);

    const getGameState = useCallback(() => {
        if (!connected) {
            console.error('Not connected to WebSocket');
            return;
        }

        if (!currentGameId) {
            console.error('Not in a game');
            return;
        }

        sendMessage({
            type: 'GET_GAME_STATE',
            data: {}
        });
    }, [connected, sendMessage, currentGameId]);

    // Chess-specific helpers
    const selectSquare = useCallback((position: Position) => {
        if (!gameState) return;

        // If no square is selected, select this one and get valid moves
        if (!selectedSquare) {
            const piece = gameState.boardState[position.y]?.[position.x];
            if (piece && piece.color === playerColor && gameState.currentPlayer === playerColor) {
                setSelectedSquare(position);
                getValidMoves(position);
            }
            return;
        }

        // If clicking the same square, deselect it
        if (selectedSquare.x === position.x && selectedSquare.y === position.y) {
            setSelectedSquare(null);
            setValidMoves([]);
            return;
        }

        // If clicking a different square of own pieces, select it
        const piece = gameState.boardState[position.y]?.[position.x];
        if (piece && piece.color === playerColor && gameState.currentPlayer === playerColor) {
            setSelectedSquare(position);
            getValidMoves(position);
            return;
        }

        // Try to make a move
        const isValidMove = validMoves.some(move => move.x === position.x && move.y === position.y);
        if (isValidMove) {
            makeMove(selectedSquare, position);
            setSelectedSquare(null);
            setValidMoves([]);
        } else {
            // Invalid move, deselect
            setSelectedSquare(null);
            setValidMoves([]);
        }
    }, [gameState, selectedSquare, playerColor, validMoves, setSelectedSquare, setValidMoves, getValidMoves, makeMove]);

    const isSquareSelected = useCallback((position: Position) => {
        return selectedSquare && selectedSquare.x === position.x && selectedSquare.y === position.y;
    }, [selectedSquare]);

    const isValidMoveSquare = useCallback((position: Position) => {
        return validMoves.some(move => move.x === position.x && move.y === position.y);
    }, [validMoves]);

    const canPlayerMove = useCallback(() => {
        return gameState && gameState.currentPlayer === playerColor && gameState.gameStatus === 'ACTIVE';
    }, [gameState, playerColor]);

    return {
        // Connection state
        connected,
        connecting,

        // Game state
        gameState,
        currentGameId,
        playerColor,
        validMoves,
        selectedSquare,
        messages,

        // Basic actions
        createGame,
        joinGame,
        makeMove,
        getValidMoves,
        leaveGame,
        sendChatMessage,
        getGameState,

        // Chess-specific helpers
        selectSquare,
        isSquareSelected,
        isValidMoveSquare,
        canPlayerMove
    };
};