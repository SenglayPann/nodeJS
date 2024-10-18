const jwt = require('jsonwebtoken');

const signToken = id => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN

  return  jwt.sign({ id }, secret, {expiresIn: expiresIn});
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

module.exports = createSendToken;