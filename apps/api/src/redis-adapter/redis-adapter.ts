import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter;

  constructor(app: any) {
    super(app);

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required for RedisIoAdapter');
    }

    const pubClient = new Redis(redisUrl);
    const subClient = pubClient.duplicate();
    this.redisAdapter = createAdapter({ pubClient, subClient });
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }
}