import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
      // password: 'yourpassword', // Uncomment if your Redis server requires authentication

    });
  }

  onModuleInit() {
    this.redisClient.on('connect', () => console.log('Connected to Redis'));
    this.redisClient.on('error', (error) =>
      console.error('Redis error', error),
    );
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }
}
