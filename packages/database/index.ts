import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma: ReturnType<typeof prismaClientSingleton> =
    globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export type {
    Prisma,
    User,   
    Game,
    CapturedPiece,
    Move,    
} from '@prisma/client';

export {
    PieceType,
    Color,
    GameStatus
} from '@prisma/client';