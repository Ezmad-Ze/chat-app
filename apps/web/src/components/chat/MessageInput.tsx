import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../lib/api';
import { Input } from '../Input';
import { Button } from '../Button';

export function MessageInput({ roomId }: { roomId: string }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token || sending || !roomId) {
      console.error('Invalid input:', { content: content.trim(), token, roomId });
      setError('Please select a room and enter a message');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const socket = getSocket(token);
      console.log('Sending message with roomId:', roomId);

      const response = await socket.emitWithAck(
        'sendMessage',
        {
          roomId,
          content: content.trim(),
        },
        5000,
      );

      if (response.success) {
        setContent('');
        console.log('Message sent successfully:', response.data);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t">
      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending || !roomId}
          maxLength={500}
        />
        <Button type="submit" disabled={!content.trim() || sending || !roomId}>
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </form>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
        {content.length}/500
      </div>
    </div>
  );
}