const mongoose = require("mongoose");
const { isEmail } = require("validator");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Minimum password length is 6 characters"],
    },
    passResetToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
