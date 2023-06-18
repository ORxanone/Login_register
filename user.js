require('dotenv').config();
const express = require('express');
const cryto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/userModels');

const router = express.Router();




router.post('/registration', async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = cryto.pbkdf2Sync(password, process.env.SALT, 10000, 64, 'sha512');

    try {
        const existUser = await User.findOne({ username });
        if (existUser) {
            res.status(400).send({ message: "Username already exists" });
            return;
        }

        const user = await User.create({ username, email, password: hashedPassword });
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

router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = cryto.pbkdf2Sync(password, process.env.SALT, 10000, 64, 'sha512');

    try {
        const user = await User.findOne({ email, password: hashedPassword });
        if (user) {
            const { password, ...theRest } = user;
            const accsessToken = jwt.sign(theRest, process.env.SECRET_KEY);
            res.status(200).send({ accsessToken });
        } else {
            res.status(401).send({ message: 'Email or password is wrong' });
        }



    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


module.exports = router;



