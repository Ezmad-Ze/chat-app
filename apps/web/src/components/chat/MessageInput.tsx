import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/api';
import { Input } from '../Input';
import { Button } from '../Button';

export function MessageInput({ roomId }: { roomId: number }) {
  const [content, setContent] = useState('');
  const { token } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token) return;

    const socket = getSocket(token);
    socket.emit('sendMessage', { roomId, content });
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!content.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}