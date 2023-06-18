const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const accessToken = req.headers['authorization'];

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, '12345');
            req.user = decoded; // Attach the decoded user information to the request object
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


