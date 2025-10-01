import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*'} })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomId: number) {
    client.join(roomId.toString());
    const messages = await this.chatService.getMessages(roomId);
    client.emit('messages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { roomId: number; content: string; userId: number }) {
    const message = await this.chatService.createMessage(payload.content, payload.userId, payload.roomId);
    this.server.to(payload.roomId.toString()).emit('message', message);
  }
}