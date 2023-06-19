require('dotenv').config();
const express = require('express');
const connect = require('./db')
const userRouter = require('./user');
const verifyToken = require('./middleware/auth');


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// app.use(verifyToken);

app.use('/', userRouter);


connect();
app.listen(PORT, () => {
    console.log("Node connected");
});
