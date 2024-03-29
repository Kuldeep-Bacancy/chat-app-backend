import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required!'],
    index: true,
    lowercase: true,
    unique: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
    required: [true, "Username is requierd!"]
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
   refreshToken: {
    type: String
   },
   resetPasswordToken: {
    type: String
   }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  )
}

userSchema.methods.generateResetPasswordToken = async function(){
  let resetPasswordToken  = crypto.randomBytes(20).toString('hex');
  let incryptedToken = await bcrypt.hash(resetPasswordToken, 10)

  return incryptedToken
}

export const User = mongoose.model('User', userSchema)

