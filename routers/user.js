require("dotenv").config();
const express = require("express");
const cryto = require("crypto");
const jwt = require("jsonwebtoken");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const nodemailer = require("nodemailer");
const User = require("../model/userModel");
const router = express.Router();

const app = express();

router.post("/registration", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400).send({ message: "Email already exists" });
      return;
    }
    const hashedPassword = cryto.pbkdf2Sync(
      password,
      process.env.SALT,
      10000,
      64,
      "sha512"
    );

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.send("Registration successfull");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = cryto.pbkdf2Sync(
    password,
    process.env.SALT,
    10000,
    64,
    "sha512"
  );

  try {
    const user = await User.findOne({ email, password: hashedPassword }).select(
      "-password"
    );
    if (user) {
      const { ...theRest } = user;
      const accsessToken = jwt.sign(theRest, process.env.SECRET_KEY);
      res.status(200).send({ user, accsessToken });
    } else {
      res.status(401).send({ message: "Email or password is wrong" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.put("/user/:id", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = cryto.pbkdf2Sync(
    password,
    process.env.SALT,
    10000,
    64,
    "sha512"
  );

  const updated = { ...req.body };
  updated.password = hashedPassword;

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updated); 
  res.send(updatedUser);
});

router.get("/forgot-password", (req, res, next) => {
  res.render("forgot-password");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      res.send({ message: "User not Exist" });
      return;
    }
    const { ...theRest } = user;
    const token = jwt.sign(theRest, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });
    user.passResetToken = token;

    user.save();
    const link = `${process.env.BACKEND_URL}/reset-password/${user.id}/${token}`;
    // nodemaile
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SERVICE_USER,
        pass: process.env.SERVICE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SERVICE_USER,
      // User's email
      to: email,
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // nodemaile
    res.send("Password resend link has been sen to email...");
  } catch (error) {
    res.send(error.message);
  }
});

router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findById(id);
  try {
    res.render("reset-password", { email: user.email });
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  const user = await User.findById(id);

  if (token !== user.passResetToken) {
    res.status(403).send({ message: "Invalid URL" });
  }
  const hashedPassword = cryto.pbkdf2Sync(
    password,
    process.env.SALT,
    10000,
    64,
    "sha512"
  );
  user.password = hashedPassword;
  console.log(this);
  user.passResetToken = null;
  user.save();

  res.send("Reset password successfull");
});
module.exports = router;
