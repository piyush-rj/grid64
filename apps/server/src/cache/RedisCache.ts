import Redis from "ioredis";
import { GameState } from "../types/web-socket-types";

export class RedisCache {
    private redis: Redis;
    private pubClient: Redis;
    private subClient: Redis;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'http://localhost:6380');

        this.pubClient = new Redis(process.env.REDIS_URL || 'http://localhost:6380');

        this.subClient = new Redis(process.env.REDIS_URL || 'http://localhost:6380');
    }

    // <--------------------------- game-state-events ---------------------------> 
    public async setGameState(gameId: string, gameState: GameState, ttl: number = 3600): Promise<void> {
        const key = `game:${gameId}`;
        await this.redis.setex(key, ttl, JSON.stringify(gameState));

        await this.pubClient.publish(`game:${gameId}:updates`, JSON.stringify({
            type: 'GAME_STATE_UPDATE',
            gameId,
            gameState,
        }));
    }

    public async getGameState(gameId: string): Promise<GameState | null> {
        const key = `game:${gameId}`;
        const data = await this.redis.get(key);

        return data ? JSON.parse(data) : null;
    }

    public async deleteGameState(gameId: string): Promise<void> {
        const key = `game:${gameId}`;
        await this.redis.del(key);

        await this.pubClient.publish(`game:${gameId}:updates`, JSON.stringify({
            type: 'GAME_DELETED',
            gameId,
        }));
    }

    // <--------------------------- player-state-events ---------------------------> 
    public async setPlayerGame(playerId: string, gameId: string, ttl: number = 3600): Promise<void> {
        const key = `player:${playerId}:game`;
        await this.redis.setex(key, ttl, gameId);


    }

    public async getPlayerGame(playerId: string): Promise<string | null> {
        const key = `player:${playerId}:game`;
        return await this.redis.get(key);
    }

    public async deletePlayerGame(playerId: string): Promise<void> {
        const key = `player:${playerId}:game`;
        await this.redis.del(key);
    }

    // <--------------------------- active-player-events ---------------------------> 
    public async addPlayerToGame(gameId: string, playerId: string): Promise<void> {
        const key = `game:${gameId}:players`;
        await this.redis.sadd(key, playerId);
        await this.redis.expire(key, 3600);
    }

    public async removePlayerFromGame(gameId: string, playerId: string): Promise<void> {
        const key = `game:${gameId}:players`;
        await this.redis.srem(key, playerId);
    }

    public async getGamePlayers(gameId: string): Promise<string[]> {
        const key = `game:${gameId}:players`;
        return await this.redis.smembers(key);
    }

    // <--------------------------- game-queue-events ---------------------------> 
    public async addPlayerToQueue(playerId: string, rating: number): Promise<void> {
        await this.redis.zadd('matchmaking:queue', rating, playerId);
        await this.redis.expire('matchmaking:queue', 600); // 10 min queue timeout
    }

    public async removePlayerFromQueue(playerId: string): Promise<void> {
        await this.redis.zrem('matchmaking:queue', playerId);
    }

    public async getQueuedPlayers(minRating: number, maxRating: number, limit: number = 10): Promise<string[]> {
        return await this.redis.zrangebyscore('matchmaking:queue', minRating, maxRating, 'LIMIT', 0, limit);
    }

    // <--------------------------- session-management-events ---------------------------> 
    public async setPlayerSession(playerId: string, sessionData: any, ttl: number = 86400): Promise<void> {
        const key = `session:${playerId}`;
        await this.redis.setex(key, ttl, JSON.stringify(sessionData));
    }

    public async getPlayerSession(playerId: string): Promise<any | null> {
        const key = `session:${playerId}`;
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    public async deletePlayerSession(playerId: string): Promise<void> {
        const key = `session:${playerId}`;
        await this.redis.del(key);
    }

    // <--------------------------- rate-limiting-events ---------------------------> 
    public async checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
        const key = `ratelimit:${identifier}`;
        const current = await this.redis.incr(key);

        if (current === 1) {
            await this.redis.expire(key, window);
        }

        return current <= limit;
    }

    // <--------------------------- pub-sub-events ---------------------------> 
    public async subscribeToGameUpdates(gameId: string, callback: (message: any) => void): Promise<void> {
        const channel = `game:${gameId}:updates`;
        await this.subClient.subscribe(channel);

        this.subClient.on('message', (receivedChannel, message) => {
            if (receivedChannel === channel) {
                try {
                    callback(JSON.parse(message));
                } catch (error) {
                    console.error('Error in parsing pub/sub msg');
                }
            }
        })
    }

    public async unsubscribeToGameUpdates(gameId: string): Promise<void> {
        const channel = `game:${gameId}:updates`;
        await this.subClient.unsubscribe(channel);
    }

    public async publishGameUpdate(gameId: string, updateType: string, data: any): Promise<void> {
        const channel = `game:${gameId}:updates`;
        await this.pubClient.publish(channel, JSON.stringify({
            type: updateType,
            gameId,
            data,
            timestamp: Date.now(),
        }));
    }

    // <--------------------------- utility-events ---------------------------> 
    public async exists(key: string): Promise<boolean> {
        return (await this.redis.exists(key)) === 1;
    }

    public async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
        await this.redis.setex(key, ttl, value);
    }

    public async increment(key: string, by: number = 1): Promise<number> {
        return await this.redis.incrby(key, by);
    }

    public async decrement(key: string, by: number = 1): Promise<number> {
        return await this.redis.decrby(key, by);
    }

    // <--------------------------- connection-events --------------------------->
    public async disconnect(): Promise<void> {
        await this.redis.disconnect();
        await this.pubClient.disconnect();
        await this.subClient.disconnect();
    }

    public async flushCache(): Promise<void> {
        await this.redis.flushall();
    }

    // health check
    public async ping(): Promise<string> {
        return await this.redis.ping();
    }

    // batch ops for optimization
    public async mset(keyValuePairs: Record<string, string>): Promise<void> {
        const args: string[] = [];
        for (const [key, value] of Object.entries(keyValuePairs)) {
            args.push(key, value);
        }
        await this.redis.mset(...args);
    }

    public async mget(keys: string[]): Promise<(string | null)[]> {
        return await this.redis.mget(...keys);
    }
}