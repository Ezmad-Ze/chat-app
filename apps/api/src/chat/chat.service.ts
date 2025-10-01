import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  async createRoom(name: string, userId: string) {
    return this.prisma.room.create({
      data: { name, users: { connect: { id: userId } } },
    });
  }

  async getMessages(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(content: string, userId: string, roomId: string) {
    return this.prisma.message.create({
      data: { content, userId, roomId },
      include: { user: true },
    });
  }
}