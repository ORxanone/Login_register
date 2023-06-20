require("dotenv").config();
const express = require("express");
const cryto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./models/userModels");
const router = express.Router();

router.post("/registration", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existUser = await User.findOne({ username });
    if (existUser) {
      res.status(400).send({ message: "Username already exists" });
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
    res.send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
  // if (req.body) {
  //     const user = await User.create(req.body);
  // }else{
  //     res.status(400).send({message: "Enter the information"}) // bos gonderilir
  // }
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
    // populate
    // select
    // sort
    // limit
    // skip

    // const user = (await User.find({ email, password: hashedPassword }).select("-password"))[0];
    const user = await User.findOne({ email, password: hashedPassword }).select(
      "-password"
    );

    // findByIdAndUpdate
    // find
    // findByIdAndDelete
    // updateMany
    // deleteMany

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
  console.log(updated);
  updated.password = hashedPassword;

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updated); //------------------
  res.send(updatedUser);
});


router.get('/', (req, res) => {
  res.send('Hello word')
});

router.get('/forgot-password', (req, res, next) => {
  res.render('forgot-password');
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      res.send({ message: "User not Exist" });
      return;
    }
    const user = await User.findOne({ email }).select(
      "-password"
    );
    const { ...theRest } = user;
    const accsessToken = jwt.sign(theRest, process.env.SECRET_KEY, { expiresIn: "5m" });
    const link = `http://localhost:8080/reset-password/${oldUser.id}/${accsessToken}`;
    console.log(link);
    res.send('Password resend link has been sen to email...')

  } catch (error) {
    res.send(error.message);
  }
});

router.get('/reset-password/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  // const user = await User.findOne(id)

  if (id !== User.id) {
    res.send('Invalid Id');
    return;
  }
  const secret = process.env.SECRET_KEY + User.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render('reset-password', { email: User.email })

  } catch (error) {
    res.send(error.message)
  }
});

router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params;

})









// sntp mail gondermek 
module.exports = router;
