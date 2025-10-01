import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173', credentials: true } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = { userId: payload.sub, email: payload.email };
    } catch (error) {
      client.disconnect();
      throw new UnauthorizedException('Invalid token');
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, dto: JoinRoomDto) {
    client.join(dto.roomId);
    const messages = await this.chatService.getMessages(dto.roomId);
    client.emit('messages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, dto: SendMessageDto) {
    const message = await this.chatService.createMessage(dto.content, client.data.user.userId, dto.roomId);
    this.server.to(dto.roomId).emit('message', message);
  }
}