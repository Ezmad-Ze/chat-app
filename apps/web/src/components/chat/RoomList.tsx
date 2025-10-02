import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, getSocket } from '../../lib/api';
import { Card, CardContent } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { useNavigate } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
}

export function RoomList({
  selectedRoomId,
  onSelectRoom,
}: {
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      loadRooms();
      setupSocketListeners();
    } else {
      setRooms([]);
      if (!token) {
        console.log('No token, redirecting to auth');
        navigate('/auth');
      }
    }
  }, [token, user, navigate]);

  const loadRooms = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const roomsData = await api.getRooms(token);
      console.log('Rooms loaded:', roomsData);
      setRooms(roomsData);
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
      if (error.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate('/auth');
        }, 3000);
      } else {
        setError(error.message || 'Failed to load rooms');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!token) return;

    const socket = getSocket(token);

    const handleRoomCreated = (newRoom: Room) => {
      setRooms((prev) => {
        if (prev.find((room) => room.id === newRoom.id)) {
          return prev;
        }
        return [...prev, newRoom];
      });
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('error', (data) => {
      console.error('Socket error:', data);
      if (data.message.includes('Invalid token')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate('/auth');
        }, 3000);
      } else {
        setError(data.message || 'Socket error occurred');
      }
    });

    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('error');
    };
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !token) return;

    setLoading(true);
    setError(null);
    try {
      const socket = getSocket(token);
      console.log('Sending createRoom with payload:', { name: newRoomName.trim() });
      const response = await socket.emitWithAck(
        'createRoom',
        { name: newRoomName.trim() },
        5000
      );
      if (response.success) {
        console.log('Room created successfully:', response.data);
        onSelectRoom(response.data.id);
      } else {
        throw new Error(response.error || 'Failed to create room');
      }
    } catch (error: any) {
      console.error('Failed to create room:', error);
      if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate('/auth');
        }, 3000);
      } else {
        setError(error.message || 'Failed to create room');
      }
    } finally {
      setLoading(false);
      setNewRoomName('');
      setIsCreating(false);
    }
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="space-y-2 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Rooms</h3>
          <Button size="sm" variant="outline" disabled>
            New Room
          </Button>
        </div>
        <div className="flex-1 text-center text-muted-foreground py-4">
          Loading rooms...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Rooms</h3>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          variant="outline"
          disabled={loading}
        >
          New Room
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-2 rounded">
          {error}
        </div>
      )}

      {isCreating && (
        <Card className="p-3">
          <form onSubmit={handleCreateRoom} className="space-y-2">
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              autoFocus
              disabled={loading}
              minLength={3}
              maxLength={50}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={!newRoomName.trim() || loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewRoomName('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No rooms available. Create one!
          </div>
        ) : (
          rooms.map((room) => (
            <Card
              key={room.id}
              className={`cursor-pointer transition-colors ${
                selectedRoomId === room.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onSelectRoom(room.id)}
            >
              <CardContent className="p-3">
                <div className="font-medium truncate">{room.name}</div>
                <div className="text-xs text-muted-foreground">
                  Click to join
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}