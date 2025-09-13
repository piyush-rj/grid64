import { CapturedPieces } from '@/src/components/Game/CapturedPieces';
import { ChessBoard } from '@/src/components/Game/ChessBoard';
import { GameControls } from '@/src/components/Game/GameControls';
import { GameInfo } from '@/src/components/Game/GameInfo';
import { ChatBox } from '@/src/components/Game/ChatBox';
import { MoveHistory } from '@/src/components/Game/MoveHistory';
import React from 'react';
import GameFooterProfile from '@/src/components/Game/GameProfile';

export const ChessApp: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-950 p-8 relative flex justify-center items-center">
            <div className="max-w-7xl mx-auto w-full flex flex-row gap-8 justify-center items-start">

                <div className="flex flex-col gap-6 w-72">
                    <GameInfo />
                    <MoveHistory />
                    <CapturedPieces />
                    <GameControls />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <ChessBoard />
                </div>

                <div className="flex flex-col w-80 space-y-3">
                    <ChatBox />
                </div>
            </div>

            <div className="absolute top-3 right-4">
                <GameFooterProfile />
            </div>

            <div className='absolute bottom-6 left-6 text-neutral-200 text-[22px] tracking-wider'>
                <span>Grid</span><span className='text-[#7675BE]'>64</span>
            </div>
        </div>
    );
};

export default ChessApp;
