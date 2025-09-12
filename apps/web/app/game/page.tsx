import { CapturedPieces } from '@/src/components/Game/CapturedPieces';
import { ChessBoard } from '@/src/components/Game/ChessBoard';
import { GameControls } from '@/src/components/Game/GameControls';
import React from 'react';

export const ChessApp: React.FC = () => {

    return (
        <div className="min-h-screen bg-neutral-950 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-neutral-200">
                    Chess Game
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
                    <div className="order-2 lg:order-1">
                        <GameControls />
                    </div>

                    <div className="order-1 lg:order-2 flex flex-col items-center">
                        <ChessBoard />
                    </div>

                    <div className="order-3 lg:order-3">
                        <CapturedPieces />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChessApp;