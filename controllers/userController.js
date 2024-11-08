const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const createSendToken = require('../utils/createSendToken');
const User = require('../models/userModel');
const factory = require('../factories/handlerFactory');
const filterObj = require('../utils/filterObj');

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = catchAsync( async (req, res, next) => {
  // 1) CREATER AN ERROR IF USER POSTS PASSWORD DATA
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This Route is not for password updates. Please use updateMyPassword route.', 400));
  };

  // 2) FILTERED OUT UNWANTED FIELDS NAME THAT ARE NOT ALLOWED TO BE UPDATED
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  // 3) UPDATE USER DOCUMENT
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
