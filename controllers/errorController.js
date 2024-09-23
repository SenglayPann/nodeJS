const AppError = require("../utils/appError");

const handleDBError = (error) => {
  const message =  `Invalid ${error.path}: ${error.value}`;
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
    let error = {...err}

    if (err.name === 'CastError') error = handleDBError(err)

    sendErrorProd(error, res);
  };

  next();
};