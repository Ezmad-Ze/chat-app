import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { RoomList } from '../components/chat/RoomList';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';

interface Room {
  id: string;
  name: string;
}

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      if (!token) return;
      try {
        const roomsData = await api.getRooms(token);
        setRooms(roomsData);

        const storedRoomId = localStorage.getItem('selectedRoomId');
        if (storedRoomId && roomsData.some((room: Room) => room.id === storedRoomId)) {
          setSelectedRoomId(storedRoomId);
        } else {
          localStorage.removeItem('selectedRoomId');
          setSelectedRoomId(null);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
        logout();
        navigate('/auth');
      }
    };

    loadRooms();
  }, [token, logout, navigate]);

  useEffect(() => {
    if (selectedRoomId !== null) {
      localStorage.setItem('selectedRoomId', selectedRoomId);
    } else {
      localStorage.removeItem('selectedRoomId');
    }
  }, [selectedRoomId]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="p-4 max-w-6xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chat Rooms</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              Welcome, {user.username}!
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Available Rooms</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <RoomList
              onSelectRoom={setSelectedRoomId}
              selectedRoomId={selectedRoomId}
            />
          </div>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          {selectedRoomId ? (
            <>
              <MessageList roomId={selectedRoomId} />
              <MessageInput roomId={selectedRoomId} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a room to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}