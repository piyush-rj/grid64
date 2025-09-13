import prisma, { Color } from "@repo/db";
import { GameState, GameStatusEnum, Move } from "../types/web-socket-types";

interface QueueProps {
    id: string;
    type: 'GAME_CREATION' | 'PLAYER_JOIN' | 'MOVE' | 'GAME_UPDATE' | 'GAME_END' | 'GAME_DELETION';
    data: any,
    retries: number,
    timestamp: number,
}

export class DatabaseQueue {
    private queue: QueueProps[] = [];
    private processing: boolean = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private maxRetries: number = 3;
    private batchSize: number = 10;

    constructor() {
        this.startProcessing();
    }

    private startProcessing(): void {
        this.processingInterval = setInterval(() => {
            if (!this.processing && this.queue.length > 0) {
                this.processQueue();
            }
        }, 1000); //every 1 sec
    }

    public async processQueue(): Promise<void> {
        if (this.processing) return;

        this.processing = true;
        try {
            while (this.queue.length > 0) {
                const batch = this.queue.splice(0, this.batchSize);
                await this.processBatch(batch);
            }
        } catch (error) {
            console.error('Error in processing queue: ', error);
        } finally {
            this.processing = false;
        }
    }

    private async processBatch(items: QueueProps[]): Promise<void> {
        const results = await Promise.allSettled(
            items.map(item => this.processItem(item))
        );

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const item = items[index];
                if (item && item.retries < this.maxRetries) {
                    item.retries++;
                    this.queue.push(item);
                } else {
                    console.error(`Failed to process item after ${this.maxRetries} retries:`, item);
                }
            }
        });
    }

    private addToQueue(type: QueueProps['type'], data: any): void {
        const item: QueueProps = {
            id: this.generateId(),
            type,
            data,
            retries: 0,
            timestamp: Date.now()
        };

        this.queue.push(item);
    }

    // <--------------------------- queue-events ---------------------------> 

    public queueGameCreation(data: { gameId: string; playerId?: string; color: Color; }): void {
        this.addToQueue('GAME_CREATION', data);
    }

    public queuePlayerJoin(data: { gameId: string, playerId: string, color: Color }): void {
        this.addToQueue('PLAYER_JOIN', data);
    }

    public queueMove(data: { gameId: string, playerId: string, move: Move }): void {
        this.addToQueue('MOVE', data);
    }

    public queueGameEnd(data: { gameId: string, status: GameStatusEnum, winner: string | null }): void {
        this.addToQueue('GAME_END', data);
    }

    public queueGameStatusUpdate(data: { gameId: string, status: GameStatusEnum }): void {
        this.addToQueue('GAME_UPDATE', data);
    }

    // FIXED: Parameter type corrected
    public queueGameDeletion(gameId: string): void {
        this.addToQueue('GAME_DELETION', gameId);
    }

    private async processItem(item: QueueProps): Promise<void> {
        switch (item.type) {
            case 'GAME_CREATION':
                await this.handleGameCreation(item.data);
                break;
            case 'PLAYER_JOIN':
                await this.handlePlayerJoin(item.data);
                break;
            case 'MOVE':
                await this.handleMakeMove(item.data);
                break;
            case 'GAME_END':
                await this.handleGameEnd(item.data);
                break;
            case 'GAME_UPDATE':
                await this.handleGameUpdate(item.data);
                break;
            case 'GAME_DELETION':
                await this.handleGameDeletion(item.data);
                break;
            default:
                throw new Error('invalid queue item type');
        }
    }

    // <--------------------------- db-operations ---------------------------> 

    private async handleGameCreation(data: { gameId: string, playerId: string, color: Color }): Promise<void> {
        try {
            console.log('Attempting to create game in database:', data);

            const result = await prisma.game.create({
                data: {
                    id: data.gameId,
                    status: 'WAITING',
                    currentTurn: 'WHITE',
                    whitePlayerId: data.color === 'WHITE' ? data.playerId : null,
                    blackPlayerId: data.color === 'BLACK' ? data.playerId : null,
                }
            });

            console.log('Game created successfully in database:', result);
        } catch (error) {
            console.error('Database error in handleGameCreation:', error);

            // Log specific Prisma errors
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }

            throw error;
        }
    }

    private async handlePlayerJoin(data: { gameId: string, playerId: string, color: Color }): Promise<void> {
        try {
            console.log('Attempting to update game for player join:', data);

            const updateData: any = {
                status: 'ACTIVE',
                startedAt: new Date(),
            };

            if (data.color === 'WHITE') {
                updateData.whitePlayerId = data.playerId;
            } else if (data.color === 'BLACK') {
                updateData.blackPlayerId = data.playerId;
            }

            const result = await prisma.game.update({
                where: { id: data.gameId },
                data: updateData,
            });

            console.log('Player join updated successfully:', result);
        } catch (error) {
            console.error('Database error in handlePlayerJoin:', error);
            throw error;
        }
    }

    private async handleMakeMove(data: { gameId: string, playerId: string, move: Move }): Promise<void> {
        console.log('inside handle move');
        const move = data.move;

        await prisma.move.create({
            data: {
                gameId: data.gameId,
                playerId: data.playerId,
                moveNumber: move.moveNumber,
                fromX: move.from.x,
                fromY: move.from.y,
                // FIXED: Changed from move.from.x to move.to.x
                toX: move.to.x,
                toY: move.to.y,
                piece: move.piece,
                captured: move.captured || null,
                algebraicNotation: this.generateAlgebraicNotation(move),
            }
        });

        console.log('move created in database');

        const currentTurn = await prisma.game.findUnique({
            where: { id: data.gameId },
            select: { currentTurn: true },
        });

        if (currentTurn) {
            await prisma.game.update({
                where: { id: data.gameId },
                data: {
                    currentTurn: currentTurn.currentTurn === 'WHITE' ? 'BLACK' : 'WHITE',
                    updatedAt: new Date(),
                }
            });
        }
    }

    private async handleGameEnd(data: { gameId: string, status: GameStatusEnum, winner: Color | null }): Promise<void> {
        const dbStatus = this.mapGameStatusToDb(data.status);

        await prisma.game.update({
            where: { id: data.gameId },
            data: {
                status: dbStatus,
                winner: data.winner,
                endedAt: new Date(),
            }
        });

        if (data.winner) {
            await this.updatePlayerRatings(data.gameId, data.winner);
        }
    }

    // FIXED: Changed parameter type from GameState to status only
    private async handleGameUpdate(data: { gameId: string, status: GameStatusEnum }): Promise<void> {
        await prisma.game.update({
            where: { id: data.gameId },
            data: {
                status: this.mapGameStatusToDb(data.status),
                updatedAt: new Date(),
            }
        });
    }

    // FIXED: Parameter type changed from object to string
    private async handleGameDeletion(gameId: string): Promise<void> {
        await prisma.game.delete({
            where: { id: gameId }
        });
    }

    private mapGameStatusToDb(status: GameStatusEnum): any {
        const statusMap: any = {
            [GameStatusEnum.WAITING]: 'WAITING',
            [GameStatusEnum.ACTIVE]: 'ACTIVE',
            [GameStatusEnum.CHECK]: 'CHECK',
            [GameStatusEnum.CHECKMATE]: 'CHECKMATE',
            [GameStatusEnum.STALEMATE]: 'STALEMATE'
        };

        return statusMap[status] || 'ACTIVE';
    }

    private async updatePlayerRatings(gameId: string, winner: Color): Promise<void> {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                whitePlayer: true,
                blackPlayer: true
            }
        });

        if (!game || !game.whitePlayer || !game.blackPlayer) {
            return;
        }

        const whiteRating = game.whitePlayer.rating;
        const blackRating = game.blackPlayer.rating;

        // simple ELO calculation
        const { whiteNewRating, blackNewRating } = this.calculateEloRatings(
            whiteRating,
            blackRating,
            winner
        );

        // update both players ratings
        await Promise.all([
            prisma.user.update({
                where: { id: game.whitePlayerId! },
                data: {
                    rating: whiteNewRating
                },
            }),
            prisma.user.update({
                where: { id: game.blackPlayerId! },
                data: {
                    rating: blackNewRating,
                }
            }),
        ])
    }

    private calculateEloRatings(whiteRating: number, blackRating: number, winner: Color): { whiteNewRating: number; blackNewRating: number } {
        const K = 32; // ELO K-factor

        const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
        const expectedBlack = 1 - expectedWhite;

        const whiteScore = winner === 'WHITE' ? 1 : 0;
        const blackScore = winner === 'BLACK' ? 1 : 0;

        const whiteNewRating = Math.round(whiteRating + K * (whiteScore - expectedWhite));
        const blackNewRating = Math.round(blackRating + K * (blackScore - expectedBlack));

        return { whiteNewRating, blackNewRating };
    }

    private generateAlgebraicNotation(move: Move): string {
        const pieceSymbols = {
            'KING': 'K',
            'QUEEN': 'Q',
            'ROOK': 'R',
            'BISHOP': 'B',
            'KNIGHT': 'N',
            'PAWN': ''
        };

        const fromSquare = this.positionToSquare(move.from);
        const toSquare = this.positionToSquare(move.to);
        const pieceSymbol = pieceSymbols[move.piece];
        const capture = move.captured ? 'x' : '';

        return `${pieceSymbol}${capture}${toSquare}`;
    }

    private positionToSquare(pos: { x: number; y: number }): string {
        const files = 'abcdefgh';
        return `${files[pos.x]}${8 - pos.y}`;
    }

    private generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public getQueueLength(): number {
        return this.queue.length;
    }

    public getQueueStats(): { total: number; byType: Record<string, number> } {
        const stats = {
            total: this.queue.length,
            byType: {} as Record<string, number>
        };

        this.queue.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        return stats;
    }

    public clearQueue(): void {
        this.queue = [];
    }

    public async shutdown(): Promise<void> {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        await this.processQueue();
    }
}