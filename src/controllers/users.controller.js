import { User } from "../models/user.models.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js"
import sendEmail from "../utils/SendEmail.js"

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();;

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
}

const registerUser = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.status(400).json(
        new ApiResponse(400, "Password and Confirm Password is not same!")
      )
    }

    const existingUser = await User.findOne({ email: email })

    if (existingUser) {
      return res.status(422).json(
        new ApiResponse(422, "Email already taken!")
      )
    } 

    console.log("existing User", existingUser);

    const user = await User.create({
      email,
      password,
      username
    })

    if (!user) {
      return res.status(422).json(
        new ApiResponse(422, 'Unable to create user!')
      )
    }

    return res.status(200).json(
      new ApiResponse(200, 'User created Successfully!', user)
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email: email })

    if (!existingUser) {
      return res.status(400).json(
        new ApiResponse(400, "User not found with email!")
      )
    }

    const passwordCheck = await existingUser.isPasswordCorrect(password)

    if (!passwordCheck) {
      return res.status(400).json(
        new ApiResponse(400, "Credentials Wrong!")
      )
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id)

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(200, "User logged in successfully", { user: loggedInUser, accessToken, refreshToken })
      )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const logoutUser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user?._id },
      {
        $set: {
          refreshToken: ""
        }
      },
      { new: true }
    )

    return res
      .status(200)
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json(
        new ApiResponse(200, "User logged out successfully")
      )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }

}

const forgetPassword = async(req, res) => {
  try {
    const { email } = req.body

    const existingUser = await User.findOne({ email: email })

    if (!existingUser) {
      return res.status(422).json(
        new ApiResponse(422, "Email not found!")
      )
    }

    const resetPasswordToken = await existingUser.generateResetPasswordToken()
    existingUser.resetPasswordToken = resetPasswordToken

    await existingUser.save({ validateBeforeSave: false })

    await sendEmail(existingUser.email, "Reset Password Link", `This is your reset password link. (${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken})`, res)

    return res.status(200).json(
      new ApiResponse(200, `Reset Password mail has been send to ${existingUser.email}`)
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const resetPassword = async(req, res) => {
  const { resetPasswordToken, newPassword, confirmNewPassword } = req.body

  const user = await User.findOne({ resetPasswordToken: resetPasswordToken })

  if(!user){
    return res.status(400).json(
      new ApiResponse(400, "User not found!")
    )
  }

  if(newPassword !== confirmNewPassword){
    return res.status(400).json(
      new ApiResponse(400, "Password and Confirm Password does not match!")
    )
  }

  user.password = newPassword
  user.resetPasswordToken = ""
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(
    new ApiResponse(200, "Password is updated successfully!")
  )
}

const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search

    const keywordRegex = new RegExp(keyword, 'i'); // 'i' flag for case-insensitive matching

    const users = await User.find({
      $or: [
        { username: { $regex: keywordRegex } },
        { email: { $regex: keywordRegex } }
      ],
      _id: { $ne: req.user?._id }
    }, { password: 0, refreshToken: 0 });

    return res.status(200).json(
      new ApiResponse(200, "Users Searched Successfully!", users)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

export { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, allUsers }