import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (picturePath, pictureName) => {
  try {
    if (!picturePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(picturePath, {
      resource_type: "auto",
      public_id: pictureName
    })

    fs.unlinkSync(picturePath)
    return response;

  } catch (error) {
    fs.unlinkSync(picturePath) // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
}

const deleteImageFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    return null
  }
}


export { uploadOnCloudinary, deleteImageFromCloudinary }