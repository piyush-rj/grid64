import { Color, Move, PieceTypeEnum, Position } from '../types/web-socket-types';
import { is_inside_board } from "../utils/chess-utils";
import { Piece } from "./Piece";

export class Board {
    private board: (Piece | null)[][];

    constructor() {
        this.board = this.initialize_board();
    }

    private initialize_board(): (Piece | null)[][] {
        const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
            Array<Piece | null>(8).fill(null)
        );

        const piece_order: PieceTypeEnum[] = [
            PieceTypeEnum.ROOK,
            PieceTypeEnum.KNIGHT,
            PieceTypeEnum.BISHOP,
            PieceTypeEnum.QUEEN,
            PieceTypeEnum.KING,
            PieceTypeEnum.BISHOP,
            PieceTypeEnum.KNIGHT,
            PieceTypeEnum.ROOK,
        ];

        for (let i = 0; i < 8; i++) {
            board[0]![i] = Piece.create_piece("BLACK", piece_order[i]!);
            board[1]![i] = Piece.create_piece("BLACK", PieceTypeEnum.PAWN);

            board[7]![i] = Piece.create_piece("WHITE", piece_order[i]!);
            board[6]![i] = Piece.create_piece("WHITE", PieceTypeEnum.PAWN);
        }



        return board;
    }

    public get_piece(x: number, y: number) {
        if (!is_inside_board(x, y)) return;
        return this.board[y]![x];
    }

    private set_piece(x: number, y: number, piece: Piece | null) {
        if (!is_inside_board(x, y)) return;
        this.board[y]![x] = piece;
        return this.board;
    }

    public is_empty(x: number, y: number): boolean {
        return this.get_piece(x, y) === null;
    }

    public is_opponent_piece(x: number, y: number, color: Color): boolean {
        const piece = this.get_piece(x, y);
        if (!piece) {
            return false;
        }
        if (piece.color !== color) {
            return true;
        }

        return false;
    }

    public is_valid_move(from: Position, to: Position): boolean {
        if (!is_inside_board(to.x, to.y)) return false;

        const piece = this.get_piece(from.x, from.y);
        if (!piece) return false;

        const targetPiece = this.get_piece(to.x, to.y);
        if (!targetPiece) return true;

        if (targetPiece.color !== piece.color) return true;

        return false;
    }

    public make_move(from: Position, to: Position) {
        const piece = this.get_piece(from.x, from.y);
        if (!piece) return null;

        const capturedPiece = this.get_piece(to.x, to.y);

        this.set_piece(to.x, to.y, piece);
        this.set_piece(from.x, from.y, null);

        piece.has_moved = true;

        return {
            from,
            to,
            piece: piece.type,
            captured: capturedPiece?.type,
        };
    }

    public get_board() {
        return this.board;
    }

    public clone_board(): Board {
        const new_board = new Board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y]![x];
                if (piece) {
                    const new_piece = Piece.create_piece(piece.color, piece.type);
                    new_piece.has_moved = piece.has_moved;
                    new_board.board[y]![x] = new_piece;
                } else {
                    new_board.board[y]![x] = null;
                }
            }
        }
        return new_board
    }
}
