"use client"
import { useChessSocket } from '@/src/hooks/useChessSocket';
import React, { useState } from 'react';

export const GameControls: React.FC = () => {
    const [gameIdInput, setGameIdInput] = useState<string>('');
    const [chatMessage, setChatMessage] = useState<string>('');

    const {
        connected,
        connecting,
        gameState,
        currentGameId,
        playerColor,
        messages,
        createGame,
        joinGame,
        leaveGame,
        sendChatMessage
    } = useChessSocket();

    const handleCreateGame = () => {
        if (connected) {
            createGame();
        }
    };

    const handleJoinGame = () => {
        if (connected && gameIdInput.trim()) {
            joinGame(gameIdInput.trim());
            setGameIdInput('');
        }
    };

    const handleLeaveGame = () => {
        if (connected && currentGameId) {
            leaveGame();
        }
    };

    const handleSendMessage = () => {
        if (connected && currentGameId && chatMessage.trim()) {
            sendChatMessage(chatMessage.trim());
            setChatMessage('');
        }
    };

    const getConnectionStatus = () => {
        if (connecting) return 'Connecting...';
        if (connected) return 'Connected';
        return 'Disconnected';
    };

    const getGameStatus = () => {
        if (!gameState) return 'No game';

        const status = gameState.gameStatus;
        switch (status) {
            case 'WAITING':
                return 'Waiting for opponent';
            case 'ACTIVE':
                return 'Game in progress';
            case 'CHECK':
                return `${gameState.currentPlayer} is in check`;
            case 'CHECKMATE':
                const winner = gameState.currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
                return `Checkmate! ${winner} wins`;
            case 'STALEMATE':
                return 'Stalemate - Draw';
            case 'DRAW':
                return 'Game drawn';
            default:
                return status;
        }
    };

    return (
        <div className="w-80 space-y-6">

            <div className="bg-neutral-800 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-neutral-200">Game Controls</h3>

                {!currentGameId ? (
                    <div className="space-y-4">
                        <button
                            onClick={handleCreateGame}
                            disabled={!connected}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Create New Game
                        </button>

                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Enter Game ID"
                                value={gameIdInput}
                                onChange={(e) => setGameIdInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={!connected}
                            />
                            <button
                                onClick={handleJoinGame}
                                disabled={!connected || !gameIdInput.trim()}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
                            >
                                Join Game
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-sm">
                                <span className="font-medium">Game ID:</span>
                                <span className="ml-2 font-mono text-xs bg-neutral-950 px-2 py-1 rounded">
                                    {currentGameId}
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Status:</span>
                                <span className="ml-2">{getGameStatus()}</span>
                            </div>
                            {playerColor && (
                                <div className="text-sm">
                                    <span className="font-medium">Playing as:</span>
                                    <span className="ml-2 font-semibold">{playerColor}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLeaveGame}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Leave Game
                        </button>
                    </div>
                )}
            </div>

            {currentGameId && (
                <div className="bg-neutral-900 rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Chat</h3>

                    <div className="h-40 overflow-y-auto mb-4 bg-gray-50 rounded p-2 space-y-1">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 text-sm">No messages yet...</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="text-sm">
                                    <span className="font-medium text-blue-600">
                                        {msg.playerId.substring(0, 8)}...
                                    </span>
                                    <span className="ml-2">{msg.message}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            maxLength={200}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors text-sm"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            {gameState && gameState.moveHistory.length > 0 && (
                <div className="bg-neutral-900 rounded-lg p-4 shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Move History</h3>
                    <div className="h-32 overflow-y-auto space-y-1">
                        {gameState.moveHistory.map((move, index) => (
                            <div key={index} className="text-sm flex justify-between">
                                <span>{index + 1}.</span>
                                <span>
                                    {String.fromCharCode(97 + move.from.x)}{8 - move.from.y} →{' '}
                                    {String.fromCharCode(97 + move.to.x)}{8 - move.to.y}
                                </span>
                                <span className="text-gray-600">{move.piece}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};