const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiration: Date
}));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

// Forgot Password route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token
  const resetToken = uuidv4();
  const resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

  // Save reset token to the user's document
  user.resetToken = resetToken;
  user.resetTokenExpiration = resetTokenExpiration;
  await user.save();

  // Send password reset email
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Reset Password',
    text: `To reset your password, please click on the following link: ${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Password reset email sent' });
  });
});

// Password Reset route
app.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // Find the user by reset token and check token expiration
  const user = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  // Update user's password
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiration = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});