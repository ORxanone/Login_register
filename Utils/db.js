
const mongoose = require('mongoose');


const connect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("MonDB Connected");
    }).catch((err) => {
        console.log(err.message);
    })
}

module.exports = connect;