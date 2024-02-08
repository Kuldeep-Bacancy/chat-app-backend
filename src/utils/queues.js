import { Queue } from "bullmq";
import { redisConnection } from "./redisConfig.js";

export const sendEmailQueue = new Queue('sendEmailQueue', redisConnection)
export const deleteImageQueue = new Queue('deleteImageQueue', redisConnection)
export const uploadImageQueue = new Queue("uploadImageQueue", redisConnection)