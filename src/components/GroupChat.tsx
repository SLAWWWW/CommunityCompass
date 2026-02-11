import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { DEMO_USER_ID } from "@/lib/constants";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface Message {
    id: string;
    group_id: string;
    user_id: string;
    user_name: string;
    message: string;
    timestamp: string;
}

interface GroupChatProps {
    groupId: string;
    currentUser: User;
}

export default function GroupChat({ groupId, currentUser }: GroupChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const res = await api.get<Message[]>(`/api/v1/groups/${groupId}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchMessages();

        // Poll for new messages every 2 seconds
        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [groupId]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await api.post(`/api/v1/groups/${groupId}/messages`, {
                message: inputMessage.trim()
            });
            setInputMessage("");
            // Fetch messages immediately after sending
            await fetchMessages();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="glass-panel border-primary/10 flex flex-col h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Group Chat
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 gap-3 pb-3">
                {/* Messages Area */}
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isOwnMessage = msg.user_id === DEMO_USER_ID;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                                    >
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {msg.user_name} · {formatTime(msg.timestamp)}
                                        </div>
                                        <div
                                            className={`max-w-[80%] rounded-lg px-3 py-2 ${isOwnMessage
                                                    ? "bg-primary text-black"
                                                    : "bg-white/10 text-white"
                                                }`}
                                        >
                                            <p className="text-sm break-words">{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="flex gap-2">
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={isSending}
                        className="flex-1 bg-white/5 border-primary/20"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isSending}
                        size="icon"
                        className="bg-primary text-black hover:bg-primary/90"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
