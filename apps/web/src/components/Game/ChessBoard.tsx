"use client";
import React, { useState } from "react";
import { useChessSocket } from "@/src/hooks/useChessSocket";
import { Position, SerializedPiece } from "@/src/store/useChessGameStore";

const KingSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8.5 16a3.5 3.5 0 1 1 3.163 -5h.674a3.5 3.5 0 1 1 3.163 5z" />
        <path d="M9 6h6" />
        <path d="M12 3v8" />
    </svg>
);

const QueenSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M16 16l2 -11l-4 4l-2 -5l-2 5l-4 -4l2 11" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M18 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </svg>
);

const RookSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8 16l1 -9h6l1 9" />
        <path d="M6 4l.5 3h11l.5 -3" />
        <path d="M10 4v3" />
        <path d="M14 4v3" />
    </svg>
);

const BishopSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M9.5 16c-1.667 0 -2.5 -1.669 -2.5 -3c0 -3.667 1.667 -6 5 -7c3.333 1 5 3.427 5 7c0 1.284 -.775 2.881 -2.325 3l-.175 0h-5z" />
        <path d="M15 8l-3 3" />
        <path d="M12 5v1" />
    </svg>
);

const KnightSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M9 3l1 3l-3.491 2.148a1 1 0 0 0 .524 1.852h2.967l-2.073 6h7.961l.112 -5c0 -3 -1.09 -5.983 -4 -7c-1.94 -.678 -2.94 -1.011 -3 -1z" />
    </svg>
);

const PawnSVG = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="50"
        height="50"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3a3 3 0 0 1 3 3c0 1.113 -.6 2.482 -1.5 3l1.5 7h-6l1.5 -7c-.9 -.518 -1.5 -1.887 -1.5 -3a3 3 0 0 1 3 -3z" />
        <path d="M8 9h8" />
        <path d="M6.684 16.772a1 1 0 0 0 -.684 .949v1.279a1 1 0 0 0 1 1h10a1 1 0 0 0 1 -1v-1.28a1 1 0 0 0 -.684 -.948l-2.316 -.772h-6l-2.316 .772z" />
    </svg>
);

const PieceComponent: React.FC<{ piece: SerializedPiece }> = ({ piece }) => {
    const getPieceIcon = () => {
        switch (piece.type) {
            case "KING":
                return <KingSVG />;
            case "QUEEN":
                return <QueenSVG />;
            case "ROOK":
                return <RookSVG />;
            case "BISHOP":
                return <BishopSVG />;
            case "KNIGHT":
                return <KnightSVG />;
            case "PAWN":
                return <PawnSVG />;
            default:
                return null;
        }
    };

    return (
        <div
            className={`
        md:w-10 md:h-10 w-8 h-8 flex items-center justify-center
        ${piece?.color === "WHITE"
                    ? "text-neutral-950 fill-neutral-300 drop-shadow-xl size-10"
                    : "text-[#bdbdbd] fill-black size-10 drop-shadow-xl"
                }
      `}
        >
            {getPieceIcon()}
        </div>
    );
};

const ChessSquare: React.FC<{
    piece: SerializedPiece | null;
    isLight: boolean;
    isSelected: boolean;
    isValidMove: boolean;
    isKingInCheck: boolean;
    onClick: () => void;
}> = ({
    piece,
    isLight,
    isSelected,
    isValidMove,
    isKingInCheck,
    onClick,
}) => {
        return (
            <div
                className={`
        md:w-18 md:h-18 h-10 w-10 flex items-center justify-center cursor-pointer relative
        ${isLight ? 'bg-[#232E3B]' : 'bg-[#3a5f76]'}
        ${isSelected ? 'ring-2 ring-[#aaa9e0] ring-inset' : ''}
        ${isValidMove ? 'ring-2 ring-[#7675BE] ring-inset' : ''}
        ${isKingInCheck ? 'bg-red-500/50' : ''}
        hover:brightness-110
      `}
                onClick={onClick}
            >
                {piece && <PieceComponent piece={piece} />}
                {isValidMove && !piece && (
                    <div className="w-3 h-3 bg-[#7675BE] rounded-full opacity-70"></div>
                )}
            </div>
        );
    };




export const ChessBoard: React.FC = () => {
    const { gameState, playerColor, selectSquare, isSquareSelected, isValidMoveSquare } =
        useChessSocket();

    const [showOverlay, setShowOverlay] = useState<boolean>(true);

    if (!gameState) {
        return (
            <>
                <div className="block md:hidden w-screen px-8">
                    <div className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 flex items-center justify-center rounded-lg">
                        <p className="text-neutral-300">Create OR Join a game</p>
                    </div>
                </div>

                <div className="hidden md:flex md:w-100 md:h-100 px-3 py-2 bg-neutral-900 border border-neutral-700 items-center justify-center rounded-lg">
                    <p className="text-neutral-300">Create OR Join a game</p>
                </div>
            </>
        );

    }

    const boardToRender =
        playerColor === "BLACK"
            ? [...gameState.boardState].reverse().map((row) => [...row].reverse())
            : gameState.boardState;

    const getActualPosition = (displayRow: number, displayCol: number): Position => {
        if (playerColor === "BLACK") {
            return { x: 7 - displayCol, y: 7 - displayRow };
        }
        return { x: displayCol, y: displayRow };
    };

    const getGameStatus = (): string => {
        switch (gameState.gameStatus) {
            case "WAITING":
                return "Waiting for opponent";
            case "ACTIVE":
                return "Game in progress";
            case "CHECK":
                return `${gameState.currentPlayer} is in check`;
            case "CHECKMATE": {
                const winner = gameState.currentPlayer === "WHITE" ? "BLACK" : "WHITE";
                return `Checkmate! ${winner} wins`;
            }
            case "STALEMATE":
                return "Stalemate - Draw";
            case "DRAW":
                return "Game drawn";
            default:
                return gameState.gameStatus;
        }
    };

    const kingInCheckPosition: Position | null = (() => {
        if (gameState.gameStatus !== "CHECK") return null;
        for (let y = 0; y < gameState.boardState.length; y++) {
            for (let x = 0; x < gameState.boardState[y].length; x++) {
                const piece = gameState.boardState[y][x];
                if (
                    piece &&
                    piece.type === "KING" &&
                    piece.color === gameState.currentPlayer
                ) {
                    return { x, y };
                }
            }
        }
        return null;
    })();

    return (
        <>
            <div className="md:hidden w-screen flex flex-col items-center relative">
                <div
                    className={`
        relative grid grid-cols-8 gap-0 border-2 border-neutral-700 rounded-lg overflow-hidden
        ${gameState.gameStatus === "CHECKMATE" && showOverlay ? "blur-sm" : ""}
      `}
                >
                    {boardToRender.map((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                            const actualPosition = getActualPosition(rowIndex, colIndex);
                            const isLight = (rowIndex + colIndex) % 2 === 0;
                            const isSelected = isSquareSelected(actualPosition);
                            const isValidMove = isValidMoveSquare(actualPosition);

                            const isKingInCheck =
                                kingInCheckPosition &&
                                kingInCheckPosition.x === actualPosition.x &&
                                kingInCheckPosition.y === actualPosition.y;

                            return (
                                <ChessSquare
                                    key={`${rowIndex}-${colIndex}`}
                                    piece={piece}
                                    isLight={isLight}
                                    isSelected={!!isSelected}
                                    isValidMove={isValidMove}
                                    isKingInCheck={!!isKingInCheck}
                                    onClick={() => selectSquare(actualPosition)}
                                />
                            );
                        })
                    )}
                </div>

                {gameState.gameStatus === "CHECKMATE" && showOverlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <p className="text-2xl font-bold text-white mb-4 bg-black/70 px-6 py-3 rounded-lg">
                            {getGameStatus()}
                        </p>
                        <button
                            className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                            onClick={() => setShowOverlay(false)}
                        >
                            Back
                        </button>
                    </div>
                )}
            </div>


            {/* desktop viewport */}
            <div className="hidden md:flex flex-col items-center relative">
                <div
                    className={`
        relative grid grid-cols-8 gap-0 border-2 border-neutral-700 rounded-lg overflow-hidden
        ${gameState.gameStatus === "CHECKMATE" && showOverlay ? "blur-sm" : ""}
      `}
                >
                    {boardToRender.map((row, rowIndex) =>
                        row.map((piece, colIndex) => {
                            const actualPosition = getActualPosition(rowIndex, colIndex);
                            const isLight = (rowIndex + colIndex) % 2 === 0;
                            const isSelected = isSquareSelected(actualPosition);
                            const isValidMove = isValidMoveSquare(actualPosition);

                            const isKingInCheck =
                                kingInCheckPosition &&
                                kingInCheckPosition.x === actualPosition.x &&
                                kingInCheckPosition.y === actualPosition.y;

                            return (
                                <ChessSquare
                                    key={`${rowIndex}-${colIndex}`}
                                    piece={piece}
                                    isLight={isLight}
                                    isSelected={!!isSelected}
                                    isValidMove={isValidMove}
                                    isKingInCheck={!!isKingInCheck}
                                    onClick={() => selectSquare(actualPosition)}
                                />
                            );
                        })
                    )}
                </div>

                {gameState.gameStatus === "CHECKMATE" && showOverlay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <p className="text-2xl font-bold text-white mb-4 bg-black/70 px-6 py-3 rounded-lg">
                            {getGameStatus()}
                        </p>
                        <button
                            className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                            onClick={() => setShowOverlay(false)}
                        >
                            Back
                        </button>
                    </div>
                )}

                <div className="hidden md:block mt-4 text-center space-x-6 tracking-wide">
                    <p className="text-sm text-neutral-400">
                        Playing as: <span className="font-semibold">{playerColor || "Observer"}</span>
                    </p>
                    <p className="text-sm text-neutral-400">
                        Current turn: <span className="font-semibold">{gameState.currentPlayer}</span>
                    </p>
                    <p className="text-sm text-neutral-400">
                        Status: <span className="font-semibold">{getGameStatus()}</span>
                    </p>
                </div>
            </div>
        </>

    );
};
