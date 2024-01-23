import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
    console.log(`DB Connection Successfull: ${connect.connection.host}`);
  } catch (error) {
    console.log(`DB Connection Failed: ${error.message}`);
  }

}

export default connectDB