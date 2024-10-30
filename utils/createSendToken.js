const exp = require('constants');
const jwt = require('jsonwebtoken');

const cookieOptions = {
  expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true
}

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const signToken = id => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN

  return  jwt.sign({ id }, secret, {expiresIn: expiresIn});
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

module.exports = createSendToken;