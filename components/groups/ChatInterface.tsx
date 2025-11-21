"use client";

import { useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, user: 'Alice', text: 'Has anyone finished Chapter 4?', time: '10:30 AM', isMe: false },
        { id: 2, user: 'Bob', text: 'Yes! The part about dynamic programming was tricky.', time: '10:32 AM', isMe: false },
        { id: 3, user: 'You', text: 'I agree. I found a great video explaining it, let me share.', time: '10:33 AM', isMe: true },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setMessages([...messages, {
            id: messages.length + 1,
            user: 'You',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        }]);
        setMessage('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        AL
                    </div>
                    <div>
                        <h3 className="font-bold">Algorithms Study Group</h3>
                        <p className="text-xs text-emerald-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            12 online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-3 text-sm",
                            msg.isMe
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-muted text-foreground rounded-bl-none"
                        )}>
                            {!msg.isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.user}</p>}
                            <p>{msg.text}</p>
                            <p className={cn("text-[10px] mt-1 text-right", msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="w-full bg-muted/50 border-none rounded-full py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                        <button className="absolute right-2 top-2 text-muted-foreground hover:text-primary">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={handleSend}
                        className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
