require('dotenv').config();
const express = require('express');
const connect = require('./db')
const userRouter = require('./user');
const verifyToken = require('./middleware/auth');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.set('view enjine', 'ejs');

const PORT = process.env.PORT || 8080;

// app.use(verifyToken);


// start forgot

app.set('view engine', 'ejs')


app.use('/', userRouter);


connect();
app.listen(PORT, () => {
    console.log("Node connected");
});
