const AppError = require("../utils/appError");

const handleExpiredTokenError = (error) => {
  const message = 'Your token has expired, Please Log in again!';
  return new AppError(message, 401);
}

const handleJWTError = (error) => {
  const message = 'Invalid token, please login again!'
  return new AppError(message, 401);
}

const handleDBError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

const handleDBDuplicateFileError = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} already exists`;
  return new AppError(message, 400);
};

const handleDBValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = errors.join(', ');
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {

  // OPERATIONAL, TRUSTED ERROR, SEND MESSAGE TO CLIENT
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // PROGRAMMING ERROR OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR TO THE CLIENT
  else {
    console.log('ERROR: ', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong, please try again later.'
    });
  };
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  else if (process.env.NODE_ENV === 'production'){
    let error = Object.assign({}, err);
    error.message = err.message;
    error.name = err.name;
    
    if (error.name === 'CastError') error = handleDBError(err);
    if (error.code === 11000) error = handleDBDuplicateFileError(err);
    if (error.name === 'ValidationError') error = handleDBValidationError(err);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError(err);
    
    sendErrorProd(error, res);
  };
};