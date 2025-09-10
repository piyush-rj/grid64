import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import router from "./src/routes";
import initServices, { gameManagerClient, redisCacheClient } from "./src/services/initServices";
import { ChessWebSocketServer } from "./src/sockets/ChessWebSocketServer";
import prisma from "@repo/db";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 8080;

async function testDatabase() {
    try {
        const testResult = await prisma.game.findMany({ take: 1 });
        console.log('Database test successful:', testResult);
    } catch (error) {
        console.error('Database test failed:', error);
    }
}

testDatabase();
initServices();
new ChessWebSocketServer(server, gameManagerClient, redisCacheClient);

app.use("/api/v1", router);

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
