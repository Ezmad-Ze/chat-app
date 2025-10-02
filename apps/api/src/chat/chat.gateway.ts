import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RoomService } from '../room/room.service';
import { JoinRoomDto } from '../room/dto/join-room.dto';
import { SendMessageDto } from '../room/dto/send-message.dto';
import { CreateRoomDto } from '../room/dto/create-room.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, UseFilters } from '@nestjs/common';
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception instanceof Error ? exception.message : 'Unknown error';
    client.emit('error', { message: error });
    const callback = host.getArgByIndex(2);
    if (typeof callback === 'function') {
      callback({ success: false, error });
    }
  }
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private chatService: ChatService,
    private roomService: RoomService,
    private jwtService: JwtService,
  ) {
    if (!jwtService) {
      console.error('JwtService is undefined in ChatGateway');
    }
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      if (!token) {
        console.error('No token provided for socket connection');
        throw new UnauthorizedException('No token provided');
      }
      const payload = await this.jwtService.verifyAsync(token);
      console.log('Socket connected, user:', payload.username, 'Payload:', payload);
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
      };
    } catch (error) {
      console.error('Socket connection error:', error.message, 'Token:', client.handshake.auth.token);
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, dto: JoinRoomDto, ack?: (response: any) => void) {
    try {
      if (!dto.roomId || typeof dto.roomId !== 'string') {
        throw new Error('Invalid or missing room ID');
      }
      client.join(dto.roomId);

      await this.roomService.joinRoom(dto.roomId, client.data.user.userId);

      const messages = await this.chatService.getMessages(dto.roomId);
      client.emit('messages', messages);

      this.server.to(dto.roomId).emit('userJoined', {
        user: client.data.user,
        roomId: dto.roomId,
      });

      console.log(`User ${client.data.user.username} joined room ${dto.roomId}`);
      if (typeof ack === 'function') {
        ack({ success: true });
      }
    } catch (error) {
      console.error('Join room error:', error);
      client.emit('error', { message: error.message || 'Failed to join room' });
      if (typeof ack === 'function') {
        ack({ success: false, error: error.message || 'Failed to join room' });
      }
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(client: Socket, dto: CreateRoomDto, ack?: (response: any) => void) {
    try {
      if (!dto[0].name || typeof dto[0].name !== 'string' || dto[0].name.trim().length < 3) {
        throw new Error('Room name must be a string with at least 3 characters');
      }
      console.log('Create room request from user:', client.data.user.username, 'DTO:', dto);
      const room = await this.roomService.createRoom(dto[0].name, client.data.user.userId);

      this.server.emit('roomCreated', room);

      console.log(`Room created: ${room.name} by user ${client.data.user.username}`);
      if (typeof ack === 'function') {
        ack({ success: true, data: room });
      }
    } catch (error) {
      console.error('Create room error:', error);
      client.emit('error', { message: error.message || 'Failed to create room' });
      if (typeof ack === 'function') {
        ack({ success: false, error: error.message || 'Failed to create room' });
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, dto: SendMessageDto, ack?: (response: any) => void) {
    try {
      if (!dto.roomId || typeof dto.roomId !== 'string') {
        throw new Error('Invalid or missing room ID');
      }
      if (!dto.content || typeof dto.content !== 'string' || dto.content.trim().length === 0) {
        throw new Error('Message content must be a non-empty string');
      }

      const room = await this.roomService.getRoom(dto.roomId);
      if (!room) {
        throw new Error('Room does not exist');
      }

      const message = await this.chatService.createMessage(
        dto.content.trim(),
        client.data.user.userId,
        dto.roomId,
      );

      this.server.to(dto.roomId).emit('message', message);

      console.log(`Message sent to room ${dto.roomId} by ${client.data.user.username}`);
      if (typeof ack === 'function') {
        ack({ success: true, data: message });
      }
    } catch (error) {
      console.error('Send message error:', error);
      client.emit('error', { message: error.message || 'Failed to send message' });
      if (typeof ack === 'function') {
        ack({ success: false, error: error.message || 'Failed to send message' });
      }
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, dto: JoinRoomDto, ack?: (response: any) => void) {
    try {
      if (!dto.roomId || typeof dto.roomId !== 'string') {
        throw new Error('Invalid or missing room ID');
      }
      client.leave(dto.roomId);
      this.server.to(dto.roomId).emit('userLeft', {
        user: client.data.user,
        roomId: dto.roomId,
      });
      console.log(`User ${client.data.user.username} left room ${dto.roomId}`);
      if (typeof ack === 'function') {
        ack({ success: true });
      }
    } catch (error) {
      console.error('Leave room error:', error);
      client.emit('error', { message: error.message || 'Failed to leave room' });
      if (typeof ack === 'function') {
        ack({ success: false, error: error.message || 'Failed to leave room' });
      }
    }
  }
}