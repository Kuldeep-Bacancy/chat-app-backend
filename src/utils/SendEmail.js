import nodemailer from "nodemailer"

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

const sendEmail = async (data) => {
  const { to, subject, text } = data
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
    console.log("Mail error", error);
  }
}

export default sendEmail

