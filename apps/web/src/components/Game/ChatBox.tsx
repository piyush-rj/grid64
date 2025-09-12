"use client";
import { useChessSocket } from '@/src/hooks/useChessSocket';
import { useUserSessionStore } from '@/src/store/useUserSessionStore';
import React, { useState } from 'react';

export const ChatBox: React.FC = () => {
    const [chatMessage, setChatMessage] = useState<string>('');
    const { currentGameId, sendChatMessage, messages } = useChessSocket();
    const { session } = useUserSessionStore();

    const handleSendMessage = () => {
        if (currentGameId && chatMessage.trim()) {
            sendChatMessage(chatMessage.trim());
            setChatMessage('');
        }
    };

    return (
        <div className="flex flex-col bg-neutral-900 rounded-lg p-4 shadow-sm border border-neutral-700 h-full">
            <h3 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">Chat</h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 bg-neutral-900 rounded p-2 space-y-1 min-h-[300px]">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages yet...</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="text-sm">
                            <span className="font-medium text-[#7675BE]">
                                {msg.playerId === session?.user?.id ? 'You' : 'Opponent'}
                            </span>
                            <span className="ml-2">{msg.message}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    maxLength={200}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-[#7675BE] hover:bg-[#6463a1] shadow-xl disabled:bg-gray-400 text-neutral-950 tracking-wide px-4 py-2 rounded-md transition-colors text-sm"
                >
                    Send
                </button>
            </div>
        </div>
    );
};
