import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/api';

export function MessageList({ roomId }: { roomId: number }) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    // Join room and get initial messages
    socket.emit('joinRoom', roomId);

    socket.on('messages', (initialMessages: any[]) => {
      setMessages(initialMessages);
    });

    socket.on('message', (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off('messages');
      socket.off('message');
    };
  }, [roomId, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} currentUserId={1} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Theme-aware message bubble
function MessageBubble({
  message,
  currentUserId,
}: {
  message: { id: number; content: string; user: { id: number; username: string } };
  currentUserId: number;
}) {
  const isOwn = message.user.id === currentUserId;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {!isOwn && (
          <div className="text-xs opacity-70 mb-1">{message.user.username}</div>
        )}
        <div>{message.content}</div>
      </div>
    </div>
  );
}