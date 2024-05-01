import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      // Redis connection configuration
      host: '127.0.0.1', // Redis server host
      port: 6379, // Redis server port
      // password: 'yourpassword', // Uncomment if your Redis server requires authentication
      // Additional options if needed
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
