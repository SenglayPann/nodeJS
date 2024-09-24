const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = id => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN

  return  jwt.sign({ id }, secret, {expiresIn: expiresIn});
}

exports.signup = catchAsync( async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //  1) check if email and password is exist
  if (!email || !password) {
    next(new AppError('Please pprovide email and password!', 400));
  }

  // 2) check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');
  const isCorrect = await user.correctPassword(password, user.password);

  if (!user || !isCorrect) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) check if everything is okay, send token to the cilent.
  const token = signToken(user._id)
  res.status(200).json({
    status: 'success',
    token,
  })
})