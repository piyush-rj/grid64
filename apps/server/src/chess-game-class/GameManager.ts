import { Game } from "./Game";
import { GameState, GameStatusEnum, Move, Position } from "../types/web-socket-types";
import { RedisCache } from "../cache/RedisCache";
import { DatabaseQueue } from "../queue/DatabaseQueue";

export class GameManager {
    private games: Map<string, Game> = new Map(); // gameId, Game
    private playerGameMap: Map<string, string> = new Map(); // playerId, gameId (FIXED)

    constructor(
        private redisCache: RedisCache,
        private databaseQueue: DatabaseQueue,
    ) { }

    public async createGame(playerId: string): Promise<{ gameId: string, gameState?: GameState }> {
        console.log('inside 1')
        const existingGameId = this.playerGameMap.get(playerId);
        if (existingGameId) {
            await this.removePlayerFromGame(playerId, existingGameId);
        }

        const gameId = this.generateGameId();
        const game = new Game(gameId);

        const playerResult = game.add_player(playerId);

        this.games.set(gameId, game);

        this.playerGameMap.set(playerId, gameId);

        await this.redisCache.setGameState(gameId, game.get_game_state());
        await this.redisCache.setPlayerGame(playerId, gameId);

        console.log('creating a game ------->');
        this.databaseQueue.queueGameCreation({
            gameId,
            playerId,
            color: playerResult.color,
        });

        console.log('updated the game ------->')
        return {
            gameId,
            gameState: game.get_game_state(),
        };
    }

    public async joinGame(playerId: string, gameId: string): Promise<{ success: boolean; gameState?: GameState; error?: string }> {
        const existingGameId = this.playerGameMap.get(playerId);
        if (existingGameId && existingGameId !== gameId) {
            await this.removePlayerFromGame(playerId, existingGameId);
        }

        let game = this.games.get(gameId);
        if (!game) {
            const cachedState = await this.redisCache.getGameState(gameId);
            if (cachedState) {
                game = this.restoreGameFromCache(gameId, cachedState);
            } else {
                return {
                    success: false,
                    error: 'Game not found',
                }
            }
        }

        try {
            const playerResult = game?.add_player(playerId);
            this.games.set(gameId, game!);

            this.playerGameMap.set(playerId, gameId);

            await this.redisCache.setGameState(gameId, game?.get_game_state()!);
            await this.redisCache.setPlayerGame(playerId, gameId);

            await this.databaseQueue.queuePlayerJoin({
                gameId,
                playerId,
                color: playerResult?.color!,
            });

            return {
                success: true,
                gameState: game?.get_game_state(),
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to join game',
            }
        }
    }

    public async makeMove(playerId: string, gameId: string, from: Position, to: Position): Promise<{ success: boolean, move?: Move | undefined, gameState?: GameState, error?: string }> {
        console.log('data received is ------------>', gameId, from, to);
        let game = this.games.get(gameId);
        if (!game) {
            const cachedState = await this.redisCache.getGameState(gameId);
            if (cachedState) {
                game = this.restoreGameFromCache(gameId, cachedState);
            } else {
                return {
                    success: false,
                    error: 'Game not found',
                }
            }
        }

        console.log("gameid is ----------->", gameId);
        console.log("current player is", this.getGameState(gameId));

        const moveResult = game?.make_move(playerId, from, to);
        if (!moveResult?.success) {
            return moveResult!;
        }

        const updatedGameState = game?.get_game_state();
        await this.redisCache.setGameState(gameId, updatedGameState!);

        this.databaseQueue.queueMove({
            gameId,
            playerId,
            move: moveResult.move!
        });

        if (updatedGameState?.gameStatus === GameStatusEnum.CHECKMATE || updatedGameState?.gameStatus === GameStatusEnum.STALEMATE) {
            this.databaseQueue.queueGameEnd({
                gameId,
                status: updatedGameState.gameStatus,
                winner: updatedGameState.winner ?? null,
            });
        }

        return {
            success: true,
            move: moveResult.move,
            gameState: updatedGameState,
        };
    }

    public async getValidMoves(playerId: string, gameId: string, position: Position): Promise<Position[] | undefined> {
        let game = this.games.get(gameId);
        if (!game) {
            const cachedState = await this.redisCache.getGameState(gameId);
            if (cachedState) {
                game = this.restoreGameFromCache(gameId, cachedState);
            } else {
                return [];
            }
        }

        return game?.get_valid_moves(playerId, position);
    }

    public async getGameState(gameId: string): Promise<GameState | null> {
        const game = this.games.get(gameId);
        if (game) {
            return game.get_game_state();
        }

        const cachedState = await this.redisCache.getGameState(gameId);
        if (cachedState) {
            return cachedState;
        }

        return null;
    }

    public async getPlayerGame(playerId: string): Promise<string | null> {
        const gameId = this.playerGameMap.get(playerId);
        if (gameId) {
            return gameId;
        }

        return await this.redisCache.getPlayerGame(playerId);
    }

    public async removePlayerFromGame(playerId: string, gameId?: string): Promise<void> {
        const targetGameId = gameId || this.playerGameMap.get(playerId);
        if (!targetGameId) return;

        const game = this.games.get(targetGameId);
        if (game) {
            game.remove_player(playerId);
            const gameState = game.get_game_state();

            if (!gameState.whitePlayer && !gameState.blackPlayer) {
                this.games.delete(targetGameId);
                await this.redisCache.deleteGameState(targetGameId);
                this.databaseQueue.queueGameDeletion(targetGameId);
            } else {
                await this.redisCache.setGameState(targetGameId, gameState);
            }
        }

        this.playerGameMap.delete(playerId);
        await this.redisCache.deletePlayerGame(playerId);
    }

    private restoreGameFromCache(gameId: string, cachedState: GameState): Game {
        const game = new Game(gameId);
        game.restore_game_state(cachedState);
        this.games.set(gameId, game);
        return game;
    }

    private generateGameId(): string {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    public async cleanup(): Promise<void> {
        for (const [gameId, game] of this.games) {
            const gameState = game.get_game_state();
            this.databaseQueue.queueGameStatusUpdate({ gameId, status: gameState.gameStatus });
        }

        await this.databaseQueue.processQueue();
    }
}