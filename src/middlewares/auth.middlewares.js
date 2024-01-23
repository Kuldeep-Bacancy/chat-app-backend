import { User } from "../models/user.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const verfiyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json(
        new ApiResponse(401, "Unauthorized request!")
      )
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findOne({ _id: decodedToken?._id }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json(
        new ApiResponse(401, "Unauthorized request!")
      )
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json(
      new ApiResponse(401, error.message)
    )
  }
}

export default verfiyJWT