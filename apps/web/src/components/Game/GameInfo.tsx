"use client";
import { useChessSocket } from '@/src/hooks/useChessSocket';
import React from 'react';

export const GameInfo: React.FC = () => {
    const { gameState, currentGameId, playerColor } = useChessSocket();

    const getGameStatus = () => {
        if (!gameState) return 'No game';

        switch (gameState.gameStatus) {
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
                return gameState.gameStatus;
        }
    };

    if (!currentGameId) return null;

    return (
        <div className="bg-neutral-900 rounded-lg p-4 shadow-sm border border-neutral-700">
            <h3 className="text-lg font-semibold mb-4 text-neutral-200">Game Info</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <span className="font-medium">Game ID:</span>
                    <span className="ml-2 font-mono text-xs bg-neutral-300/80 text-black px-2 py-1 rounded">
                        {currentGameId}
                    </span>
                </div>
                <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{getGameStatus()}</span>
                </div>
                {playerColor && (
                    <div>
                        <span className="font-medium">Playing as:</span>
                        <span className="ml-2 font-semibold">{playerColor}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
