const AppError = require("../utils/appError");

const handleExpiredTokenError = () => {
  const message = 'Your token has expired, Please Log in again!';
  return new AppError(message, 401);
}

const handleJWTError = () => {
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

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  else {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    };

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  };

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    }); 

  }

  console.error('ERROR 💥', err);
  return res.status(500).render('error', {
    title: 'Something went very wrong!',
    msg: 'Please try again later!'
  });

};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
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
    
    sendErrorProd(error, req, res);
  };
};