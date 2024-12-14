import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Gmail SMTP server
      port: 587, // TLS port
      secure: false, // Use false for 
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your app password (not your regular Gmail password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to: to, // Recipient's email address
      subject: subject, // Email subject
      text: text, // Email body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // Throw error for the calling function to handle
  }
};

export default sendEmail;
