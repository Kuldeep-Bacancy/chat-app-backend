import { Redis } from "ioredis";


const redisOptions = process.env.ENV == 'development' ? process.env.REDIS_URL : {
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
}

export const redisConnection = new Redis(process.env.REDIS_URL);
