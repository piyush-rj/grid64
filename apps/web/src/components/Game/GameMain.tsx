import { CapturedPieces } from '@/src/components/Game/CapturedPieces';
import { ChessBoard } from '@/src/components/Game/ChessBoard';
import { GameControls } from '@/src/components/Game/GameControls';
import { GameInfo } from '@/src/components/Game/GameInfo';
import { ChatBox } from '@/src/components/Game/ChatBox';
import { MoveHistory } from '@/src/components/Game/MoveHistory';
import React from 'react';
import GameFooterProfile from '@/src/components/Game/GameProfile';

export const GameMain: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-950 md:p-8 relative flex justify-center items-center py-25">
            <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 justify-center items-start">

                <div className="flex flex-col gap-6 md:w-72 order-2 md:order-1">
                    <GameControls />
                    <GameInfo />
                    <MoveHistory />
                    <CapturedPieces />
                </div>

                <div className="flex flex-col items-center justify-center order-1 md:order-2">
                    <ChessBoard />
                </div>

                <div className="hidden md:block w-80 space-y-3 order-3">
                    <ChatBox />
                </div>

            </div>

            <div className="fixed top-3 right-4">
                <GameFooterProfile />
            </div>

            <div className='fixed top-6 left-6 text-neutral-200 text-[17px] md:text-[22px] tracking-wider'>
                <span>Grid</span><span className='text-[#7675BE]'>64</span>
            </div>
        </div>

    );
};

export default GameMain;
