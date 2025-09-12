"use client";
import { useChessSocket } from '@/src/hooks/useChessSocket';
import React from 'react';

export const MoveHistory: React.FC = () => {
    const { gameState } = useChessSocket();

    if (!gameState || gameState.moveHistory.length === 0) return null;

    return (
        <div className="bg-neutral-900 rounded-lg p-4 shadow-sm border border-neutral-700">
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">Move History</h3>
            <div className="h-32 overflow-y-auto custom-scrollbar space-y-2">
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
    );
};
