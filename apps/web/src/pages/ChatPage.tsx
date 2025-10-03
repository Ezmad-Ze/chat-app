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
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 border-b">
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

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 p-4">
        <Card className="lg:w-1/4 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Available Rooms</h2>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <RoomList
              onSelectRoom={setSelectedRoomId}
              selectedRoomId={selectedRoomId}
            />
          </div>
        </Card>

        <Card className="flex-1 flex flex-col min-h-0">
          {selectedRoomId ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto min-h-0">
                <MessageList roomId={selectedRoomId} />
              </div>
              <div className="flex-shrink-0 border-t">
                <MessageInput roomId={selectedRoomId} />
              </div>
            </div>
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