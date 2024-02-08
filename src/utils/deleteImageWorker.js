import { Worker } from "bullmq";
import { deleteImageFromCloudinary } from "./cloudinary.js";
import { deleteImageQueue } from "./queues.js";
import { redisConnection } from "./redisConfig.js";

export const deleteImageFromCloudinaryJob = async (job) => {
  await deleteImageQueue.add(job.type, job.data, {
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000,
    }
  })
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
    url: redisConnection
  },
};

const worker = new Worker("deleteImageQueue", workerHandler, workerOptions);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});