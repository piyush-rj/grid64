"use client";
import { useChessSocket } from '@/src/hooks/useChessSocket';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const GameControls: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [gameIdInput, setGameIdInput] = useState<string>('');
    const { connected, currentGameId, createGame, joinGame, leaveGame } = useChessSocket();

    const gameIdToJoin = searchParams.get('join');

    useEffect(() => {
        if (connected && gameIdToJoin && !currentGameId) {
            joinGame(gameIdToJoin);
            router.replace('/game');
        }
    }, [connected, gameIdToJoin, currentGameId]);

    const handleCreateGame = () => {
        if (connected) createGame();
    };

    const handleJoinGame = () => {
        if (connected && gameIdInput.trim()) {
            joinGame(gameIdInput.trim());
            setGameIdInput('');
        }
    };

    const handleLeaveGame = () => {
        if (connected && currentGameId) leaveGame();
    };

    return (
        <div className="rounded-lg shadow-sm">
            {!currentGameId ? (
                <>
                    <div className="block md:hidden w-screen px-8">
                        <div className="space-y-4">
                            <button
                                onClick={handleCreateGame}
                                disabled={!connected}
                                className="w-full bg-[#7675BE] hover:bg-[#6463a1] shadow-xl disabled:bg-gray-400 text-neutral-950 tracking-wide py-2 px-4 rounded-md transition-colors"
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
                                    className="w-full bg-neutral-200 hover:bg-neutral-300 hover:-translate-y-0.5 transition-all transform duration-200 disabled:bg-gray-400 text-black py-2 px-4 rounded-md tracking-wide"
                                >
                                    Join Game
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block space-y-4">
                        <button
                            onClick={handleCreateGame}
                            disabled={!connected}
                            className="w-full bg-[#7675BE] hover:bg-[#6463a1] shadow-xl disabled:bg-gray-400 text-neutral-950 tracking-wide py-2 px-4 rounded-md transition-colors"
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
                                className="w-full bg-neutral-200 hover:bg-neutral-300 hover:-translate-y-0.5 transition-all transform duration-200 disabled:bg-gray-400 text-black py-2 px-4 rounded-md tracking-wide"
                            >
                                Join Game
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='block md:hidden w-screen px-20'>
                        <button
                            onClick={handleLeaveGame}
                            className="w-full bg-[#9b1c1c] hover:bg-[#801c1c] shadow-md text-neutral-200 tracking-wide py-2 px-4 rounded-md transition-colors"
                        >
                            Leave Game
                        </button>
                    </div>

                    <div className='hidden md:block'>
                        <button
                            onClick={handleLeaveGame}
                            className="w-full bg-[#9b1c1c] hover:bg-[#801c1c] shadow-md text-neutral-200 tracking-wide py-2 px-4 rounded-md transition-colors"
                        >
                            Leave Game
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
