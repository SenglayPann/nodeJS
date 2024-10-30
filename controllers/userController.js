const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const createSendToken = require('../utils/createSendToken');
const User = require('../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

exports.updateMe = catchAsync( async (req, res, next) => {
  // 1) CREATER AN ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This Route is not for password updates. Please use updateMyPassword route.'));
  };

  // 2) UPDATE USER DOCUMENT
  const user = req.user;
  const { name } = req.body
  user.name = name;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 201, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
