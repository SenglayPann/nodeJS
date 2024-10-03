const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
  const secret = process.env.JWT_SECRET
  const expiresIn = process.env.JWT_EXPIRES_IN

  return  jwt.sign({ id }, secret, {expiresIn: expiresIn});
}

exports.signup = catchAsync( async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //  1) check if email and password is exist
  if (!email || !password) {
    next(new AppError('Please provide email and password!', 400));
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
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  const authHeaders = req.headers.authorization;

  if (authHeaders && authHeaders.startsWith('Bearer')) {
    token = authHeaders.split(' ')[1];
  };

  if (!token) {
    return next(new AppError('you are not logged in, Please login.', 401));
  };

  const secret = process.env.JWT_SECRET;

  // 2) VERIFICATION TOKEN
  const decodedToken = await promisify(jwt.verify) (token, secret);
  
  // 3) CHECK IF USER STILL EXISTS

  const currentUser = await User.findById(decodedToken.id);
  
  if(!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(new AppError('user recently changed password. Please login again!', 401));
  };

  // 5) GRAND ACCESS TO TOUR ROUTES
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You have no permission to perform this acction', 401))
    };

    next();
  }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON POSTED EMAIL
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new AppError('There is no user with email address.', 404));
  };

  // 2) GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) SEND IT TO USER'S EMAIL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a Patch request with your new password and confirm reset password to : ${resetUrl}.\n If you didn't forget your password, please login this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password Token is only valid for 10mn.',
      message
    });
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });

  } catch {
    user.passwordResetToken = undefined;
    user.resetPasswordExpires = undefined;
    return next(new AppError('There was a problem sending the email. try agaidn later.', 500));
  }

});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) GET USER BASED ON THE TOKEN 
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken, 
    passwordResetExpires: { $gte: Date.now() }
  });

  // 2) IF TOKEN HAS NOT EXPIRED, AND THERE IS USER , SET THE NEW PASSWORD
  if(!user) {
    return next(new AppError('Token is invalid or expired!'), 400)
  };
  
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) UPDATE changePasswordAt PROPERTY FOR THE USER
  
  // 4) LOG THE USER IN, SEND JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});