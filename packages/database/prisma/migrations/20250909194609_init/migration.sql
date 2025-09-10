-- CreateEnum
CREATE TYPE "public"."GameStatus" AS ENUM ('WAITING', 'ACTIVE', 'CHECK', 'CHECKMATE', 'STALEMATE', 'DRAW', 'ABANDONED', 'IN_PROGRESS', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."Color" AS ENUM ('WHITE', 'BLACK');

-- CreateEnum
CREATE TYPE "public"."PieceType" AS ENUM ('KING', 'QUEEN', 'ROOK', 'BISHOP', 'KNIGHT', 'PAWN');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."games" (
    "id" TEXT NOT NULL,
    "status" "public"."GameStatus" NOT NULL DEFAULT 'WAITING',
    "currentTurn" "public"."Color" NOT NULL DEFAULT 'WHITE',
    "winner" "public"."Color",
    "whitePlayerId" TEXT,
    "blackPlayerId" TEXT,
    "boardState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "timeControl" TEXT,
    "isRanked" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CapturedPiece" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "piece" "public"."PieceType" NOT NULL,
    "color" "public"."Color" NOT NULL,
    "moveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapturedPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moves" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "moveNumber" INTEGER NOT NULL,
    "fromX" INTEGER NOT NULL,
    "fromY" INTEGER NOT NULL,
    "toX" INTEGER NOT NULL,
    "toY" INTEGER NOT NULL,
    "piece" "public"."PieceType" NOT NULL,
    "captured" "public"."PieceType",
    "isCheck" BOOLEAN NOT NULL DEFAULT false,
    "isCheckmate" BOOLEAN NOT NULL DEFAULT false,
    "isCastle" BOOLEAN NOT NULL DEFAULT false,
    "isEnPassant" BOOLEAN NOT NULL DEFAULT false,
    "promotion" "public"."PieceType",
    "algebraicNotation" TEXT,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "moves_gameId_moveNumber_idx" ON "public"."moves"("gameId", "moveNumber");

-- AddForeignKey
ALTER TABLE "public"."games" ADD CONSTRAINT "games_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."games" ADD CONSTRAINT "games_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CapturedPiece" ADD CONSTRAINT "CapturedPiece_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CapturedPiece" ADD CONSTRAINT "CapturedPiece_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "public"."moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moves" ADD CONSTRAINT "moves_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
