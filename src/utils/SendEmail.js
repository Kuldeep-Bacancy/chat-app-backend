import nodemailer from "nodemailer"
import ApiResponse from "./ApiResponse.js";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, res) => {
  const mailOptions = {
    from: {
      name: "Chat App",
      address: process.env.SENDER_EMAIL
    },
    to: to,
    subject: subject,
    text: text
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Email send Successfuly!");
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "There are some issues while send email! Please try after some time!")
    )
  }
}

export default sendEmail

