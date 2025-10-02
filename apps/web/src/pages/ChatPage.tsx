import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';

import { Button } from '../components/Button';
import { RoomList } from '../components/chat/RoomList';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(1);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (  
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat Rooms</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[75vh]">
        <Card className="lg:col-span-1 overflow-y-auto">
          <RoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />
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