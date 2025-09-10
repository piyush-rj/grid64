import { RedisCache } from "../cache/RedisCache";
import { GameManager } from "../chess-game-class/GameManager";
import { DatabaseQueue } from "../queue/DatabaseQueue";

export let redisCacheClient: RedisCache;
export let databaseQueueClient: DatabaseQueue
export let gameManagerClient: GameManager;

export default function initServices() {
    redisCacheClient = new RedisCache();
    databaseQueueClient = new DatabaseQueue();
    gameManagerClient = new GameManager(redisCacheClient, databaseQueueClient);
}
