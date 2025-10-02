import { Card, CardContent } from '../Card';

export function RoomList({
  selectedRoomId,
  onSelectRoom,
}: {
  selectedRoomId: number | null;
  onSelectRoom: (id: number) => void;
}) {
  // TODO: Fetch from API
  const rooms = [
    { id: 1, name: 'General' },
    { id: 2, name: 'Tech' },
    { id: 3, name: 'Random' },
  ];

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={`cursor-pointer transition-colors ${
            selectedRoomId === room.id
              ? 'border-primary bg-primary/10'
              : 'hover:bg-secondary'
          }`}
          onClick={() => onSelectRoom(room.id)}
        >
          <CardContent className="p-3">{room.name}</CardContent>
        </Card>
      ))}
    </div>
  );
}