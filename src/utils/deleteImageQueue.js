import { Queue } from "bullmq";
import { Worker } from "bullmq";
import { deleteImageFromCloudinary } from "./cloudinary.js";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

const deleteImageQueue = new Queue('deleteImageQueue', redis)

export const deleteImageFromCloudinaryJob = async (job) => {
  await deleteImageQueue.add(job.type, job.data)
}

const workerHandler = async (job) => {

  try {
    console.log("Starting job------------:", job.name);
    await deleteImageFromCloudinary(job.data.name)
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

const worker = new Worker("deleteImageQueue", workerHandler, workerOptions);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});