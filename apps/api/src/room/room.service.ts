import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(name: string, userId: string) {
    try {
      const room = await this.prisma.room.create({
        data: {
          name,
          users: {
            connect: { id: userId },
          },
        },
      });
      return room;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Room name already exists');
      }
      throw error;
    }
  }

  async getRooms() {
    return this.prisma.room.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async getRoom(roomId: string) {
    return this.prisma.room.findUnique({
      where: { id: roomId },
    });
  }

  async joinRoom(roomId: string, userId: string) {
    try {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
      });
      if (!room) {
        throw new BadRequestException('Room not found');
      }

      await this.prisma.room.update({
        where: { id: roomId },
        data: {
          users: {
            connect: { id: userId },
          },
        },
      });
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Failed to join room');
    }
  }
}