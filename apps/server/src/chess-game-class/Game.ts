import { Color, GameState, GameStatusEnum, Move, PieceTypeEnum, PlayerResult, Position } from '../types/web-socket-types';
import { Board } from './Board';
import { Piece } from './Piece';

export class Game {
    private players: { [color: string]: string | null } = { WHITE: null, BLACK: null };
    private board: Board;
    private moveHistory: Move[] = [];
    private moveNumber: number = 1;
    private currentPlayer: Color = 'WHITE';
    private gameStatus: GameStatusEnum = GameStatusEnum.WAITING;
    private capturedPieces: { piece: PieceTypeEnum; capturedColor: Color }[] = [];
    private winner: string | null = null;
    private looser: string | null = null;

    constructor(public readonly gameId: string) {
        this.board = new Board();
    }

    public add_player(playerId: string): PlayerResult {
        if (!this.players.WHITE) {
            this.players.WHITE = playerId;
            return {
                playerId,
                color: 'WHITE'
            };
        } else if (!this.players.BLACK) {
            this.players.BLACK = playerId;
            if (this.gameStatus === GameStatusEnum.WAITING) {
                this.gameStatus = GameStatusEnum.ACTIVE;
            }
            return {
                playerId,
                color: 'BLACK'
            };
        } else {
            throw new Error('Game full');
        }
    }

    public remove_player(playerId: string) {
        if (this.players.WHITE === playerId) {
            this.players.WHITE = null;
        } else if (this.players.BLACK === playerId) {
            this.players.BLACK = null;
        };
    }

    public get_game_state(): GameState {
        return {
            gameId: this.gameId,
            boardState: this.board.get_board().map(row =>
                row.map(piece => piece ? {
                    type: piece.type,
                    color: piece.color,
                    has_moved: piece.has_moved
                } : null)
            ),
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            whitePlayer: this.players.WHITE!,
            blackPlayer: this.players.BLACK!,
            moveHistory: this.moveHistory,
            capturedPieces: this.capturedPieces,
            winner: this.winner,
            looser: this.looser,
        };
    }

    public restore_game_state(cached: any, moves: Move[] = []) {
        try {
            this.players.WHITE = cached?.whitePlayer ?? null;
            this.players.BLACK = cached?.blackPlayer ?? null;
            this.currentPlayer = cached?.currentPlayer || 'WHITE';
            this.gameStatus = cached?.gameStatus || GameStatusEnum.WAITING;
            this.moveHistory = moves || [];
            this.winner = cached?.winner || null;
            this.looser = cached?.looser || null;

            if (cached?.boardState) {
                this.restore_board_from_state(cached.boardState);
            } else if (moves.length) {
                this.replay_moves(moves);
            }
        } catch (err) {
            console.warn('Failed to restore game state safely:', err);
            this.board = new Board();
            this.moveHistory = moves || [];
            this.currentPlayer = 'WHITE';
            this.gameStatus = GameStatusEnum.WAITING;
            this.winner = null;
            this.looser = null;
        }
    }


    public make_move(playerId: string, from: Position, to: Position): { success: boolean; move?: Move; error?: string } {
        const playerColor = this.get_player_color(playerId);
        if (!playerColor) return {
            success: false,
            error: 'Player not in game'
        };

        if (playerColor !== this.currentPlayer) return {
            success: false,
            error: 'Not your turn'
        };

        const piece = this.board.get_piece(from.x, from.y);
        if (!piece || piece.color !== playerColor) {
            return {
                success: false,
                error: 'Invalid piece selection',
            }
        };

        const validMoves = this.get_legal_moves_for_piece(from, playerColor);
        if (!validMoves.some((m) => m.x === to.x && m.y === to.y)) {
            return {
                success: false,
                error: 'Invalid move'
            };
        }

        const moveData = this.board.make_move(from, to);
        if (!moveData) {
            return {
                success: false,
                error: 'Move failed'
            }
        };

        // add captured pieces here
        if (moveData.captured) {
            this.capturedPieces.push({
                piece: moveData.captured,
                capturedColor: playerColor,
            })
        }

        const move: any = { ...moveData, moveNumber: this.moveNumber++ };
        this.moveHistory.push(move);
        this.currentPlayer = this.currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
        this.update_game_status();

        return {
            success: true,
            move
        };
    }

    private get_player_color(playerId: string): Color | null {
        if (this.players.WHITE === playerId) return 'WHITE';
        if (this.players.BLACK === playerId) return 'BLACK';
        return null;
    }

    private update_game_status() {
        // const opponentColor: Color = this.currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
        const hasMoves = this.has_possible_moves(this.currentPlayer);
        const kingInCheck = this.is_king_in_check(this.currentPlayer);

        if (kingInCheck && !hasMoves) {
            this.gameStatus = GameStatusEnum.CHECKMATE;
            this.winner = (this.currentPlayer === 'WHITE' ? this.players.BLACK : this.players.WHITE) || null;
            this.looser = (this.currentPlayer === 'WHITE' ? this.players.WHITE : this.players.BLACK) || null;
        } else if (!kingInCheck && !hasMoves) {
            this.gameStatus = GameStatusEnum.STALEMATE;
            this.winner = null;
            this.looser = null;
        } else if (kingInCheck) {
            this.gameStatus = GameStatusEnum.CHECK;
            this.winner = null;
            this.looser = null;
        } else {
            this.gameStatus = GameStatusEnum.ACTIVE;
            this.winner = null;
            this.looser = null;
        };
    }

    private get_legal_moves_for_piece(pos: Position, color: Color): Position[] {
        const piece = this.board.get_piece(pos.x, pos.y);
        if (!piece || piece.color !== color) return [];

        const moves = piece.get_possible_moves(pos, this.board);
        const legal: Position[] = [];

        for (const m of moves) {
            const boardClone = this.board.clone_board();
            boardClone.make_move(pos, m);
            if (!this.is_king_in_check(color, boardClone)) legal.push(m);
        }

        return legal;
    }

    private is_king_in_check(color: Color, board?: Board): boolean {
        const b = board || this.board;
        const kingPos = this.find_king_position(color, b);
        if (!kingPos) return false;

        const oppColor: Color = color === 'WHITE' ? 'BLACK' : 'WHITE';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = b.get_board()[y]![x];
                if (piece && piece.color === oppColor) {
                    const moves = piece.get_possible_moves({ x, y }, b);
                    if (moves.some((m) => m.x === kingPos.x && m.y === kingPos.y)) return true;
                }
            }
        }
        return false;
    }

    private has_possible_moves(color: Color): boolean {
        const b = this.board.get_board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = b[y]![x];
                if (piece && piece.color === color) {
                    const moves = this.get_legal_moves_for_piece({ x, y }, color);
                    if (moves.length) return true;
                }
            }
        }
        return false;
    }

    private find_king_position(color: Color, board: Board): Position | null {
        const b = board.get_board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = b[y]![x];
                if (piece && piece.color === color && piece.type === PieceTypeEnum.KING) return { x, y };
            }
        }
        return null;
    }

    public get_valid_moves(playerId: string, pos: Position): Position[] {
        const color = this.get_player_color(playerId);
        if (!color || color !== this.currentPlayer) return [];

        const piece = this.board.get_piece(pos.x, pos.y);
        if (!piece || piece.color !== color) return [];

        return this.get_legal_moves_for_piece(pos, color);
    }

    private restore_board_from_state(boardState: any[][]) {
        const newBoard = new Board();
        const b = newBoard.get_board();

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                try {
                    const sd = boardState?.[y]?.[x];
                    if (sd) {
                        const piece = Piece.create_piece(sd.color, sd.type);
                        piece.has_moved = !!sd.has_moved;
                        b[y]![x] = piece;
                    } else {
                        b[y]![x] = null;
                    }
                } catch {
                    b[y]![x] = null;
                }
            }
        }
        this.board = newBoard;
    }

    private replay_moves(moves: Move[]) {
        for (const move of moves.sort((a, b) => a.moveNumber - b.moveNumber)) {
            try {
                this.board.make_move({ x: Number(move.from?.x), y: Number(move.from?.y) }, { x: Number(move.to?.x), y: Number(move.to?.y) });
            } catch (err) {
                console.warn('Failed to replay move:', err);
            }
        }
    }

    public get_captured_pieces() {
        return this.capturedPieces;
    }

    public clear_captured_pieces() {
        this.capturedPieces = [];
    }
}