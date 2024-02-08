import { Queue } from "bullmq";
import { Worker } from "bullmq";
import sendEmail from "./SendEmail.js";
import { Redis } from "ioredis";
import dotenv from 'dotenv'

dotenv.config()

const redis = new Redis(process.env.REDIS_URL);

const sendEmailQueue = new Queue('sendEmailQueue', redis)

export const sendEmailJob = async (job) => { 
  await sendEmailQueue.add(job.type, job.data)
}

const workerHandler = async (job) => {

  try {
    console.log("Starting job------------:", job.name);
    await sendEmail(job.data)
    console.log("Finished job------------:", job.name);
    return;
  } catch (error) {
    console.log("Error while running email worker", error);
  }

}

const workerOptions = {
  connection: {
    url: redis
  },
};

const worker = new Worker("sendEmailQueue", workerHandler, workerOptions);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});