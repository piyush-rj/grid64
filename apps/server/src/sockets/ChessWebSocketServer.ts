import WebSocket from 'ws';
import { IncomingMessage, Server as httpserver } from 'http';
import { RedisCache } from '../cache/RedisCache';
import {
    WebSocketMessage,
    WebSocketMessageType,
    Position,
    GameState
} from '../types/web-socket-types';
import { GameManager } from '../chess-game-class/GameManager';

interface AuthenticatedWebSocket extends WebSocket {
    playerId?: string;
    gameId?: string;
    isAlive?: boolean;
}


export class ChessWebSocketServer {
    private wss: WebSocket.Server;
    private clients: Map<string, AuthenticatedWebSocket> = new Map(); // playerId, socket
    private gameClients: Map<string, Set<string>> = new Map(); // gameId, Set<playerId>
    private guestPlayers: Set<string> = new Set();

    constructor(
        server: httpserver,
        private gameManager: GameManager,
        private redisCache: RedisCache,
    ) {
        this.wss = new WebSocket.Server({
            server,
            verifyClient: this.verifyClientSync.bind(this),
        })

        this.setupServer();
    }

    private setupServer(): void {
        this.wss.on('connection', this.handleConnection.bind(this));

        const intervalCheck = setInterval(() => {
            this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
                if (!ws.isAlive) {
                    return ws.terminate();
                }

                ws.isAlive = false;
                ws.ping();
            });
            this.cleanUpGuestPlayers();
        }, 30000);

        this.wss.on('close', () => {
            clearInterval(intervalCheck);
        });
    }

    private verifyClientSync(info: { req: IncomingMessage }): boolean {
        try {
            const url = new URL(info.req.url!, 'http://localhost');
            const playerId = url.searchParams.get('playerId');

            if (!playerId) {
                return false;
            }

            return playerId.length > 0;
        } catch (error) {
            return false;
        }
    }

    private async handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage): Promise<void> {
        const url = new URL(req.url!, 'http://localhost');
        const playerId = url.searchParams.get('playerId')!;

        ws.playerId = playerId;
        ws.isAlive = true;
        this.clients.set(playerId, ws);

        if (playerId.startsWith('guest_')) {
            this.guestPlayers.add(playerId);
        }

        ws.on('message', (data) => this.handleMessage(ws, data));
        ws.on('pong', () => { ws.isAlive = true; });
        ws.on('close', () => this.handleDisconnection(ws));
        ws.on('error', (error) => this.handleError(ws, error));

        const canConnect = await this.redisCache.checkRateLimit(`connect:${playerId}`, 10, 60);
        if (!canConnect) {
            this.sendError(ws, 'Rate limit exceeded');
            ws.close();
            return;
        }

        await this.restorePlayerSession(ws);

        this.sendMessage(ws, {
            type: WebSocketMessageType.CONNECTION_ESTABLISHED,
            data: { playerId, timestamp: Date.now() }
        });
    }

    private async handleMessage(ws: AuthenticatedWebSocket, data: WebSocket.Data): Promise<void> {
        try {
            const message: WebSocketMessage = JSON.parse(data.toString());

            const canSendMessage = await this.redisCache.checkRateLimit(
                `msg:${ws.playerId}:${message.type}`,
                this.getRateLimitForMessageType(message.type),
                60
            );

            if (!canSendMessage) {
                this.sendError(ws, 'rate limit exceeded for message type');
                return;
            }

            await this.routeMessage(ws, message);
        } catch (error) {
            console.error('Error handling message:', error);
            this.sendError(ws, 'Invalid message format');
        }
    }

    private async routeMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage): Promise<void> {
        const { type, data } = message;

        switch (type) {
            case WebSocketMessageType.CREATE_GAME:
                console.log('about to create the game');
                await this.handleCreateGame(ws);
                console.log('created the game');
                break;
            case WebSocketMessageType.JOIN_GAME:
                await this.handleJoinGame(ws, data.gameId);
                break;
            case WebSocketMessageType.MAKE_MOVE:
                await this.handleMakeMove(ws, data.from, data.to);
                break;
            case WebSocketMessageType.GET_VALID_MOVES:
                await this.handleGetValidMoves(ws, data.position);
                break;
            case WebSocketMessageType.GET_GAME_STATE:
                await this.handleGetGameState(ws);
                break;
            case WebSocketMessageType.LEAVE_GAME:
                await this.handleLeaveGame(ws);
                break;
            case WebSocketMessageType.CHAT_MESSAGE:
                await this.handleChatMessage(ws, data.message);
                break;
            default:
                this.sendError(ws, 'Unknown message type');
        }
    }

    // <--------------------------- message-events ---------------------------> 

    private async handleCreateGame(ws: AuthenticatedWebSocket): Promise<void> {
        try {
            const result = await this.gameManager.createGame(ws.playerId!);
            ws.gameId = result.gameId;
            this.addClientToGame(result.gameId, ws.playerId!);

            this.sendMessage(ws, {
                type: WebSocketMessageType.GAME_CREATED,
                data: result
            });
        } catch (error) {
            this.sendError(ws, 'Failed to create game');
        }
    }

    private async handleJoinGame(ws: AuthenticatedWebSocket, gameId: string): Promise<void> {
        try {
            const result = await this.gameManager.joinGame(ws.playerId!, gameId);
            if (result.success) {
                ws.gameId = gameId;
                this.addClientToGame(gameId, ws.playerId!);

                this.broadcastToGame(gameId, {
                    type: WebSocketMessageType.PLAYER_JOINED,
                    data: {
                        playerId: ws.playerId,
                        gameState: result.gameState
                    }
                });
            } else {
                this.sendError(ws, result.error || 'Failed to join game');
            }
        } catch (error) {
            this.sendError(ws, 'Failed to join game');
        }
    }

    private async handleMakeMove(ws: AuthenticatedWebSocket, from: Position, to: Position): Promise<void> {
        if (!ws.gameId) {
            this.sendError(ws, 'Not in a game');
            return;
        }

        try {
            console.log('data received is ------------>', ws, from, to);
            const result = await this.gameManager.makeMove(ws.playerId!, ws.gameId, from, to);
            if (result.success) {
                this.broadcastToGame(ws.gameId, {
                    type: WebSocketMessageType.MOVE_MADE,
                    data: {
                        move: result.move,
                        gameState: result.gameState,
                        playerId: ws.playerId
                    }
                });

                if (result.gameState?.gameStatus === 'CHECKMATE' ||
                    result.gameState?.gameStatus === 'STALEMATE') {
                    this.broadcastToGame(ws.gameId, {
                        type: WebSocketMessageType.GAME_ENDED,
                        data: {
                            gameState: result.gameState,
                            reason: result.gameState.gameStatus,
                            winner: result.gameState.winner,
                            looser: result.gameState.looser,
                        }
                    });
                }
            } else {
                this.sendError(ws, result.error || 'Invalid move');
            }
        } catch (error) {
            this.sendError(ws, 'Failed to make move');
        }
    }

    private async handleGetValidMoves(ws: AuthenticatedWebSocket, position: Position): Promise<void> {
        if (!ws.gameId) {
            this.sendError(ws, 'Not in a game');
            return;
        }

        try {
            const validMoves = await this.gameManager.getValidMoves(ws.playerId!, ws.gameId, position);
            this.sendMessage(ws, {
                type: WebSocketMessageType.VALID_MOVES,
                data: { position, validMoves }
            });
        } catch (error) {
            this.sendError(ws, 'Failed to get valid moves');
        }
    }

    private async handleGetGameState(ws: AuthenticatedWebSocket): Promise<void> {
        if (!ws.gameId) {
            this.sendError(ws, 'Not in a game');
            return;
        }

        try {
            const gameState = await this.gameManager.getGameState(ws.gameId);
            this.sendMessage(ws, {
                type: WebSocketMessageType.GAME_STATE,
                data: { gameState }
            });
        } catch (error) {
            this.sendError(ws, 'Failed to get game state');
        }
    }

    private async handleLeaveGame(ws: AuthenticatedWebSocket): Promise<void> {
        if (!ws.gameId) return;

        try {
            const gameId = ws.gameId;
            await this.gameManager.removePlayerFromGame(ws.playerId!, gameId);

            this.broadcastToGame(gameId, {
                type: WebSocketMessageType.PLAYER_LEFT,
                data: { playerId: ws.playerId }
            }, ws.playerId);

            this.sendMessage(ws, {
                type: WebSocketMessageType.PLAYER_LEFT,
                data: { gameId, playerId: ws.playerId }
            });

            this.removeClientFromGame(gameId, ws.playerId!);
            ws.gameId = '';
        } catch (error) {
            this.sendError(ws, 'Failed to leave game');
        }
    }

    private async handleChatMessage(ws: AuthenticatedWebSocket, message: string): Promise<void> {
        if (!ws.gameId) {
            this.sendError(ws, 'Not in a game');
            return;
        }

        this.broadcastToGame(ws.gameId, {
            type: WebSocketMessageType.CHAT_MESSAGE,
            data: {
                playerId: ws.playerId,
                message,
                timestamp: Date.now()
            }
        });
    }

    private async restorePlayerSession(ws: AuthenticatedWebSocket): Promise<void> {
        try {
            const gameId = await this.gameManager.getPlayerGame(ws.playerId!);
            if (gameId) {
                ws.gameId = gameId;
                this.addClientToGame(gameId, ws.playerId!);

                const gameState = await this.gameManager.getGameState(gameId);
                if (gameState) {
                    this.sendMessage(ws, {
                        type: WebSocketMessageType.GAME_RESTORED,
                        data: { gameState }
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring player session:', error);
        }
    }

    private handleDisconnection(ws: AuthenticatedWebSocket): void {
        if (!ws.playerId) return;

        this.clients.delete(ws.playerId);

        if (ws.playerId.startsWith('guest_')){
            this.guestPlayers.delete(ws.playerId);

            if (ws.gameId) {
                this.gameManager.removePlayerFromGame(ws.gameId, ws.playerId);
            }
        }

        if (ws.gameId) {
            this.removeClientFromGame(ws.gameId, ws.playerId);
            this.broadcastToGame(ws.gameId, {
                type: WebSocketMessageType.PLAYER_DISCONNECTED,
                data: { playerId: ws.playerId }
            });
        }
    }

    private handleError(ws: AuthenticatedWebSocket, error: Error): void {
        console.error(`WebSocket error for player ${ws.playerId}:`, error);
        this.sendError(ws, 'Connection error occurred');
    }

    private sendMessage(ws: AuthenticatedWebSocket, message: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    private sendError(ws: AuthenticatedWebSocket, error: string): void {
        this.sendMessage(ws, {
            type: WebSocketMessageType.ERROR,
            data: { error, timestamp: Date.now() }
        });
    }

    private addClientToGame(gameId: string, playerId: string): void {
        if (!this.gameClients.has(gameId)) {
            this.gameClients.set(gameId, new Set());
        }
        this.gameClients.get(gameId)!.add(playerId);
    }

    private removeClientFromGame(gameId: string, playerId: string): void {
        const gameSet = this.gameClients.get(gameId);
        if (gameSet) {
            gameSet.delete(playerId);
            if (gameSet.size === 0) {
                this.gameClients.delete(gameId);
            }
        }
    }

    private broadcastToGame(gameId: string, message: any, excludePlayerId?: string): void {
        const gameSet = this.gameClients.get(gameId);
        if (!gameSet) return;

        gameSet.forEach(playerId => {
            if (playerId !== excludePlayerId) {
                const client = this.clients.get(playerId);
                if (client) {
                    this.sendMessage(client, message);
                }
            }
        });
    }

    private getRateLimitForMessageType(type: WebSocketMessageType): number {
        const limits: any = {
            [WebSocketMessageType.MAKE_MOVE]: 10,
            [WebSocketMessageType.GET_VALID_MOVES]: 30,
            [WebSocketMessageType.GET_GAME_STATE]: 20,
            [WebSocketMessageType.CHAT_MESSAGE]: 50,
            [WebSocketMessageType.CREATE_GAME]: 5,
            [WebSocketMessageType.JOIN_GAME]: 10,
        };

        return limits[type] || 100;
    }

    public getConnectionCount(): number {
        return this.clients.size;
    }

    public getGameConnectionCount(gameId: string): number {
        return this.gameClients.get(gameId)?.size || 0;
    }

    public async shutdown(): Promise<void> {
        this.wss.close();
        await this.gameManager.cleanup();
    }

    private isGuestPlayer(playerId: string) {
        return playerId.startsWith('guest_');
    }

    public async cleanUpGuestPlayers(): Promise<void> {
        for (const guestPlayerId of this.guestPlayers) {
            const client = this.clients.get(guestPlayerId);
            if (!client || client.readyState !== WebSocket.OPEN) {
                this.guestPlayers.delete(guestPlayerId);

                await this.redisCache.deletePlayerGame(guestPlayerId);
                await this.redisCache.deletePlayerSession(guestPlayerId);
            }
        }
    }
}