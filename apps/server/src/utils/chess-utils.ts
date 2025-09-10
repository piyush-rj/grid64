import { Position, Color, PieceTypeEnum } from '../types/web-socket-types';


export function algebraic(x: number, y: number): string {
    return String.fromCharCode(97 + x) + (8 - y);
}

export function is_inside_board(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

export function positionToAlgebraic(pos: Position): string {
    const files = 'abcdefgh';
    const ranks = '87654321'; // Rank 8 is at y=0, rank 1 is at y=7
    return `${files[pos.x]}${ranks[pos.y]}`;
}

export function algebraicToPosition(algebraic: string): Position {
    const files = 'abcdefgh';
    const file = algebraic[0]!.toLowerCase();
    const rank = algebraic[1];

    return {
        x: files.indexOf(file),
        y: 8 - parseInt(rank!)
    };
}

export function getDistance(from: Position, to: Position): number {
    return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
}

export function isOnSameDiagonal(from: Position, to: Position): boolean {
    return Math.abs(from.x - to.x) === Math.abs(from.y - to.y);
}

export function isOnSameRank(from: Position, to: Position): boolean {
    return from.y === to.y;
}

export function isOnSameFile(from: Position, to: Position): boolean {
    return from.x === to.x;
}

export function getPositionsBetween(from: Position, to: Position): Position[] {
    const positions: Position[] = [];

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    const stepX = deltaX === 0 ? 0 : deltaX / Math.abs(deltaX);
    const stepY = deltaY === 0 ? 0 : deltaY / Math.abs(deltaY);

    let currentX = from.x + stepX;
    let currentY = from.y + stepY;

    while (currentX !== to.x || currentY !== to.y) {
        positions.push({ x: currentX, y: currentY });
        currentX += stepX;
        currentY += stepY;
    }

    return positions;
}

export function isLightSquare(pos: Position): boolean {
    return (pos.x + pos.y) % 2 === 0;
}

export function getOppositeColor(color: Color): Color {
    return color === 'WHITE' ? 'BLACK' : 'WHITE';
}

export function isPawnOnStartingRank(pos: Position, color: Color): boolean {
    return color === 'WHITE' ? pos.y === 6 : pos.y === 1;
}

export function isPawnOnPromotionRank(pos: Position, color: Color): boolean {
    return color === 'WHITE' ? pos.y === 0 : pos.y === 7;
}

export function getPawnDirection(color: Color): number {
    return color === 'WHITE' ? -1 : 1;
}

export function isValidAlgebraicNotation(notation: string): boolean {
    const pattern = /^[a-h][1-8]$/;
    return pattern.test(notation);
}

export function getAllSquaresOfColor(isLight: boolean): Position[] {
    const squares: Position[] = [];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isLightSquare({ x, y }) === isLight) {
                squares.push({ x, y });
            }
        }
    }

    return squares;
}

export function isCaptureMove(from: Position, to: Position, board: any): boolean {
    return board.get_piece(to.x, to.y) !== null;
}

export function getPieceFENSymbol(pieceType: PieceTypeEnum, color: Color): string {
    const symbols: any = {
        [PieceTypeEnum.KING]: 'k',
        [PieceTypeEnum.QUEEN]: 'q',
        [PieceTypeEnum.ROOK]: 'r',
        [PieceTypeEnum.BISHOP]: 'b',
        [PieceTypeEnum.KNIGHT]: 'n',
        [PieceTypeEnum.PAWN]: 'p'
    };

    const symbol = symbols[pieceType];
    return color === 'WHITE' ? symbol.toUpperCase() : symbol;
}

export function positionToIndex(pos: Position): number {
    return pos.y * 8 + pos.x;
}

export function indexToPosition(index: number): Position {
    return {
        x: index % 8,
        y: Math.floor(index / 8)
    };
}

export function isOnBoardEdge(pos: Position): boolean {
    return pos.x === 0 || pos.x === 7 || pos.y === 0 || pos.y === 7;
}

export function getAdjacentPositions(pos: Position): Position[] {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    return directions
        .map(([dx, dy]) => ({ x: pos.x + dx!, y: pos.y + dy! }))
        .filter(p => is_inside_board(p.x, p.y));
}

export function areAdjacent(pos1: Position, pos2: Position): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx <= 1 && dy <= 1 && (dx + dy > 0);
}

export function mirrorPosition(pos: Position): Position {
    return { x: pos.x, y: 7 - pos.y };
}

export function mirrorPositionHorizontally(pos: Position): Position {
    return { x: 7 - pos.x, y: pos.y };
}

export function rotatePosition180(pos: Position): Position {
    return { x: 7 - pos.x, y: 7 - pos.y };
}

export function getAllBoardPositions(): Position[] {
    const positions: Position[] = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            positions.push({ x, y });
        }
    }
    return positions;
}

export function positionInList(pos: Position, positions: Position[]): boolean {
    return positions.some(p => p.x === pos.x && p.y === pos.y);
}

export function uniquePositions(positions: Position[]): Position[] {
    const unique: Position[] = [];
    positions.forEach(pos => {
        if (!positionInList(pos, unique)) {
            unique.push(pos);
        }
    });
    return unique;
}