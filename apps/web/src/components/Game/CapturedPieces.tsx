"use client"
import { useChessSocket } from '@/src/hooks/useChessSocket';
import { Color, PieceTypeEnum } from '@/src/store/useChessGameStore';
import React from 'react';

// Small SVG Components for captured pieces
const KingSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8.5 16a3.5 3.5 0 1 1 3.163 -5h.674a3.5 3.5 0 1 1 3.163 5z" />
        <path d="M9 6h6" />
        <path d="M12 3v8" />
    </svg>
);

const QueenSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M16 16l2 -11l-4 4l-2 -5l-2 5l-4 -4l2 11" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M18 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </svg>
);

const RookSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M8 16l1 -9h6l1 9" />
        <path d="M6 4l.5 3h11l.5 -3" />
        <path d="M10 4v3" />
        <path d="M14 4v3" />
    </svg>
);

const BishopSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M9.5 16c-1.667 0 -2.5 -1.669 -2.5 -3c0 -3.667 1.667 -6 5 -7c3.333 1 5 3.427 5 7c0 1.284 -.775 2.881 -2.325 3l-.175 0h-5z" />
        <path d="M15 8l-3 3" />
        <path d="M12 5v1" />
    </svg>
);

const KnightSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8 16l-1.447 .724a1 1 0 0 0 -.553 .894v2.382h12v-2.382a1 1 0 0 0 -.553 -.894l-1.447 -.724h-8z" />
        <path d="M9 3l1 3l-3.491 2.148a1 1 0 0 0 .524 1.852h2.967l-2.073 6h7.961l.112 -5c0 -3 -1.09 -5.983 -4 -7c-1.94 -.678 -2.94 -1.011 -3 -1z" />
    </svg>
);

const PawnSVG = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 3a3 3 0 0 1 3 3c0 1.113 -.6 2.482 -1.5 3l1.5 7h-6l1.5 -7c-.9 -.518 -1.5 -1.887 -1.5 -3a3 3 0 0 1 3 -3z" />
        <path d="M8 9h8" />
        <path d="M6.684 16.772a1 1 0 0 0 -.684 .949v1.279a1 1 0 0 0 1 1h10a1 1 0 0 0 1 -1v-1.28a1 1 0 0 0 -.684 -.948l-2.316 -.772h-6l-2.316 .772z" />
    </svg>
);

const CapturedPiece: React.FC<{ piece: PieceTypeEnum; color: Color }> = ({ piece, color }) => {
    const getPieceIcon = () => {
        switch (piece) {
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
        <div className={`p-1 ${color === 'WHITE' ? 'text-gray-100' : 'text-gray-800'}`}>
            {getPieceIcon()}
        </div>
    );
};

export const CapturedPieces: React.FC = () => {
    const { gameState } = useChessSocket();

    if (!gameState || !gameState.capturedPieces) {
        return null;
    }

    const whiteCaptured = gameState.capturedPieces.filter(cp => cp.capturedColor === 'WHITE');
    const blackCaptured = gameState.capturedPieces.filter(cp => cp.capturedColor === 'BLACK');

    const pieceValues = {
        PAWN: 1,
        KNIGHT: 3,
        BISHOP: 3,
        ROOK: 5,
        QUEEN: 9,
        KING: 0
    };

    const calculateMaterialDifference = () => {
        const whiteValue = whiteCaptured.reduce((sum, cp) => sum + pieceValues[cp.piece], 0);
        const blackValue = blackCaptured.reduce((sum, cp) => sum + pieceValues[cp.piece], 0);
        return blackValue - whiteValue;
    };

    const materialDiff = calculateMaterialDifference();

    return (
        <div className="w-48 bg-neutral-800 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-center">Captured Pieces</h3>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-300">Black Pieces Captured</h4>
                <div className="flex flex-wrap gap-1 min-h-[30px] bg-neutral-300 rounded p-2">
                    {blackCaptured.map((captured, index) => (
                        <CapturedPiece
                            key={index}
                            piece={captured.piece}
                            color="BLACK"
                        />
                    ))}
                    {blackCaptured.length === 0 && (
                        <p className="text-xs text-gray-500">None</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-neutral-300">White Pieces Captured</h4>
                <div className="flex flex-wrap gap-1 min-h-[30px] bg-neutral-950 rounded p-2">
                    {whiteCaptured.map((captured, index) => (
                        <CapturedPiece
                            key={index}
                            piece={captured.piece}
                            color="WHITE"
                        />
                    ))}
                    {whiteCaptured.length === 0 && (
                        <p className="text-xs text-gray-500">None</p>
                    )}
                </div>
            </div>

            {materialDiff !== 0 && (
                <div className="text-center">
                    <p className="text-sm">
                        <span className={`font-semibold ${materialDiff > 0 ? 'text-gray-800' : 'text-gray-600'}`}>
                            {materialDiff > 0 ? 'Black' : 'White'} +{Math.abs(materialDiff)}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
};