"use client";
import { useChessSocket } from '@/src/hooks/useChessSocket';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const GameInfo: React.FC = () => {
    const { gameState, currentGameId, playerColor } = useChessSocket();
    const [copied, setCopied] = useState(false);

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

    const handleCopy = async () => {
        if (currentGameId) {
            await navigator.clipboard.writeText(currentGameId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!currentGameId) return null;

    return (
        <div className="bg-neutral-900 rounded-lg p-4 shadow-sm border border-neutral-700">
            <h3 className="text-lg font-semibold mb-4 text-neutral-200">Game Info</h3>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Game ID:</span>
                    <span className="font-mono text-xs bg-neutral-300/80 text-black px-2 py-1 rounded truncate">
                        {currentGameId}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="ml-1 text-neutral-400 hover:text-white transition"
                        aria-label="Copy Game ID"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
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
