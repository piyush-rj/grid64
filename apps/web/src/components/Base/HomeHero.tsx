"use client";
import React, { useState, useRef } from "react";
import { BishopSVG, KingSVG, KnightSVG, PawnSVG, QueenSVG, RookSVG } from "@/src/svgs/all-svgs";
import { ChevronRight } from "lucide-react";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { Button } from "../ui/Button";
import { useChessSocket } from "@/src/hooks/useChessSocket";

const allIcons = [KingSVG, QueenSVG, BishopSVG, KnightSVG, PawnSVG, RookSVG];

export default function HomeHero() {
    const { session } = useUserSessionStore();
    const router = useRouter();
    const { connected, joinGame } = useChessSocket();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [gameCode, setGameCode] = useState<string>('');

    const handleOnClick = () => {
        router.push("/game");
    };

    return (
        <div className="w-full h-screen pb-10 rounded-t-2xl relative overflow-hidden z-3">
            <div className="w-full h-full flex justify-center items-center text-6xl text-[#e4e4e4] flex-col font-medium">
                <div className="flex flex-col h-full w-full justify-center items-center gap-y-4">
                    <span className="md:text-[20px] text-[12px] px-4 tracking-wide py-1.5 border rounded-full text-neutral-300 border-neutral-700 mb-1 bg-neutral-950/50 backdrop-blur-3xl shadow-lg">
                        Losing is not an option
                    </span>
                    <span className="text-[22px] md:text-[74px] text-center">
                        {"Don't just Play. "}
                        <span className="text-[#B8B7E4]"> Dominate.</span>
                    </span>

                    <div className="flex flex-col items-center gap-2 w-full">
                        <div className="flex w-full justify-center gap-x-4">
                            <div className="relative flex items-center gap-x-2">
                                <Button
                                    onClick={() => setShowInput((prev) => !prev)}
                                    className="bg-[#c3c3d1] md:w-36 md:h-10 md:text-[20px] text-neutral-900 hover:bg-[#c3c3d1] hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Join Game
                                </Button>

                                <div
                                    className={cn(
                                        "absolute -left-1.5 top-8 ml-2 transition-all duration-300",
                                        showInput
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 -translate-y-3 pointer-events-none"
                                    )}
                                >
                                    <div className="relative w-36">
                                        <input
                                            type="text"
                                            placeholder="game_owin..."
                                            value={gameCode}
                                            onChange={(e) => setGameCode(e.target.value)}
                                            className="w-full pr-10 pl-3 py-2 placeholder:font-mono rounded-md border border-neutral-600 bg-neutral-800 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#7675be]"
                                        />
                                        <button
                                            onClick={() => {
                                                if (    gameCode.trim()) {
                                                    router.push(`/game?join=${gameCode.trim()}`);
                                                    setGameCode('');
                                                }
                                            }}
                                            className="absolute right-1.5 top-11.5 -translate-y-1/2 p-1 bg-[#000000] rounded-full text-neutral-100 text-xs hover:scale-105 transition-transform duration-200 shadow-lg"
                                        >
                                            <ChevronRight className="size-3.5" />
                                        </button>

                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleOnClick}
                                className="bg-[#7675be] md:h-10 md:w-44 md:text-[20px] text-black hover:bg-[#7675be] hover:-translate-y-0.5 transition-all duration-200 font-medium flex"
                            >
                                {session ? "Start Playing" : "Play as Guest"}
                                <span className="flex justify-center items-center">
                                    <ChevronRight />
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Bubbles */}
            <div className="hidden md:block absolute top-40 left-20 animate-float-slow">
                <Bubble icon={KingSVG} />
            </div>
            <div className="hidden md:block absolute top-105 left-60 animate-float">
                <Bubble icon={BishopSVG} />
            </div>
            <div className="hidden md:block absolute top-40 right-20 animate-float">
                <Bubble icon={QueenSVG} />
            </div>
            <div className="hidden md:block absolute top-105 right-60 animate-float-fast">
                <Bubble icon={KnightSVG} />
            </div>
        </div>
    );
}


interface BubbleProps {
    icon: React.ComponentType<{ className?: string }>;
}

export function Bubble({ icon: Icon }: BubbleProps) {
    const [CurrentIcon, setCurrentIcon] = useState(() => Icon);
    const intervalRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (intervalRef.current) return;
        intervalRef.current = window.setInterval(() => {
            const RandomIcon = allIcons[Math.floor(Math.random() * allIcons.length)];
            setCurrentIcon(() => RandomIcon);
        }, 200);
    };

    const handleMouseLeave = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setCurrentIcon(() => Icon);
        }
    };

    return (
        <div
            className="w-25 h-25 rounded-full bg-neutral-900/10 backdrop-blur-lg border border-neutral-800 flex justify-center items-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <CurrentIcon className="w-12 h-12 text-[#e4e4e4]" />
        </div>
    );
}
