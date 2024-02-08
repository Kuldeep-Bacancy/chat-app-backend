import { Worker } from "bullmq";
import { uploadOnCloudinary } from "./cloudinary.js";
import { redisConnection } from "./redisConfig.js";
import { Message } from "../models/message.models.js";
import { uploadImageQueue } from "./queues.js";

export const uploadImageOnCloudinaryJob = async (job) => {
  await uploadImageQueue.add(job.type, job.data, {
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
  let imageUrls = []
  try {
    console.log("Starting job------------:", job.name);
    let multiplePicturePromise = job.data.images.map((picture) =>
      uploadOnCloudinary(picture.path, picture.fileName)
    );

    let imageResponses = await Promise.all(multiplePicturePromise);
    imageResponses.forEach((res) => {
      imageUrls.push({ name: res.public_id, type: res.format, url: res.url })
    })

    await Message.findOneAndUpdate(
      { _id: job.data.msgId },
      { $set: { attachments: imageUrls } }
    )

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

const worker = new Worker("uploadImageQueue", workerHandler, workerOptions);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});