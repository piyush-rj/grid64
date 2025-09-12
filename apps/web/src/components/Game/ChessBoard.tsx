"use client"
import { useChessSocket } from '@/src/hooks/useChessSocket';
import { Position, SerializedPiece } from '@/src/store/useChessGameStore';
import React from 'react';

const KingSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none' />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8.5 16a3.5 3.5 0 1 1 3.163 -5h.674a3.5 3.5 0 1 1 3.163 5z" />
        <path d="M9 6h6" />
        <path d="M12 3v8" />
    </svg>
);

const QueenSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none'  />
        <path d="M16 16l2 -11l-4 4l-2 -5l-2 5l-4 -4l2 11" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M18 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </svg>
);

const RookSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none'  />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8 16l1 -9h6l1 9" />
        <path d="M6 4l.5 3h11l.5 -3" />
        <path d="M10 4v3" />
        <path d="M14 4v3" />
    </svg>
);

const BishopSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none'  />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M9.5 16c-1.667 0 -2.5 -1.669 -2.5 -3c0 -3.667 1.667 -6 5 -7c3.333 1 5 3.427 5 7c0 1.284 -.775 2.881 -2.325 3l-.175 0h-5z" />
        <path d="M15 8l-3 3" />
        <path d="M12 5v1" />
    </svg>
);

const KnightSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none'  />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M9 3l1 3l-3.491 2.148a1 1 0 0 0 .524 1.852h2.967l-2.073 6h7.961l.112 -5c0 -3 -1.09 -5.983 -4 -7c-1.94 -.678 -2.94 -1.011 -3 -1z" />
    </svg>
);

const PawnSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill='none'  />
        <path d="M12 3a3 3 0 0 1 3 3c0 1.113 -.6 2.482 -1.5 3l1.5 7h-6l1.5 -7c-.9 -.518 -1.5 -1.887 -1.5 -3a3 3 0 0 1 3 -3z" />
        <path d="M8 9h8" />
        <path d="M6.684 16.772a1 1 0 0 0 -.684 .949v1.279a1 1 0 0 0 1 1h10a1 1 0 0 0 1 -1v-1.28a1 1 0 0 0 -.684 -.948l-2.316 -.772h-6l-2.316 .772z" />
    </svg>
);

const PieceComponent: React.FC<{ piece: SerializedPiece }> = ({ piece }) => {
    const getPieceIcon = () => {
        switch (piece.type) {
            case 'KING': return <KingSVG />;
            case 'QUEEN': return <QueenSVG />;
            case 'ROOK': return <RookSVG />;
            case 'BISHOP': return <BishopSVG />;
            case 'KNIGHT': return <KnightSVG />;
            case 'PAWN': return <PawnSVG />;
            default: return null;
        }
    };

    return (
        <div
            className={
                `w-10 h-10 flex items-center justify-center
        ${piece?.color === "WHITE" ? "text-neutral-950 fill-neutral-300 drop-shadow-xl size-10" : "text-[#bdbdbd] fill-black size-10 drop-shadow-xl"}
        `}>
            {getPieceIcon()}
        </div>
    );
};

const ChessSquare: React.FC<{
    piece: SerializedPiece | null;
    isLight: boolean;
    isSelected: boolean;
    isValidMove: boolean;
    onClick: () => void;
}> = ({ piece, isLight, isSelected, isValidMove, onClick }) => {
    return (
        <div
            className={`
        w-18 h-18 flex items-center justify-center cursor-pointer relative
        ${isLight ? 'bg-[#232E3B]' : 'bg-[#3a5f76]'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isValidMove ? 'ring-2 ring-green-500 ring-inset' : ''}
        hover:brightness-110
      `}
            onClick={onClick}
        >
            {piece && <PieceComponent piece={piece} />}
            {isValidMove && !piece && (
                <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
            )}
        </div>
    );
};

export const ChessBoard: React.FC = () => {
    const { gameState, playerColor, selectSquare, isSquareSelected, isValidMoveSquare } = useChessSocket();

    if (!gameState) {
        return (
            <div className="w-100 h-100 bg-neutral-900 border border-neutral-700 flex items-center justify-center rounded-lg">
                <p className="text-neutral-300">Create OR Join a game</p>
            </div>
        );
    }

    const boardToRender = playerColor === 'BLACK'
        ? [...gameState.boardState].reverse().map(row => [...row].reverse())
        : gameState.boardState;

    const getActualPosition = (displayRow: number, displayCol: number): Position => {
        if (playerColor === 'BLACK') {
            return {
                x: 7 - displayCol,
                y: 7 - displayRow
            };
        }
        return {
            x: displayCol,
            y: displayRow
        };
    };

    return (
        <div className="flex flex-col items-center ">
            <div className="grid grid-cols-8 gap-0 border-2 border-neutral-700 rounded-lg overflow-hidden">
                {boardToRender.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                        const actualPosition = getActualPosition(rowIndex, colIndex);
                        const isLight = (rowIndex + colIndex) % 2 === 0;
                        const isSelected = isSquareSelected(actualPosition);
                        const isValidMove = isValidMoveSquare(actualPosition);

                        return (
                            <ChessSquare
                                key={`${rowIndex}-${colIndex}`}
                                piece={piece}
                                position={actualPosition}
                                isLight={isLight}
                                isSelected={isSelected!}
                                isValidMove={isValidMove}
                                onClick={() => selectSquare(actualPosition)}
                            />
                        );
                    })
                )}
            </div>

            <div className="mt-4 text-center flex space-x-6 tracking-wide">
                <p className="text-sm text-neutral-400">
                    Playing as: <span className="font-semibold">{playerColor || 'Observer'}</span>
                </p>
                <p className="text-sm text-neutral-400">
                    Current turn: <span className="font-semibold">{gameState.currentPlayer}</span>
                </p>
                <p className="text-sm text-neutral-400">
                    Status: <span className="font-semibold">{gameState.gameStatus}</span>
                </p>
            </div>
        </div>
    );
};