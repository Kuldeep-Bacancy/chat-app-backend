import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
    console.log(`DB Connection Successfull: ${connect.connection.host}`);
  } catch (error) {
    console.log(`DB Connection Failed: ${error.message}`);
  }

}

export default connectDB