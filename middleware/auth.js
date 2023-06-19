const jwt = require('jsonwebtoken');
require('dotenv').config();


const verifyToken = (req, res, next) => {
    const accessToken = req.headers['authorization'];
    

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.SALT);
            req.user = decoded;
            next();
        } catch (error) {
            console.log(error);
            res.status(401).send({ message: 'Invalid Signature' });
        }
    } else {
        res.status(401).send({ message: 'Unauthorized request' });
    }
};

module.exports = verifyToken;


