const express = require('express');
const morgan = require('morgan');

const appError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`req sent at ${ req.requestTime}`)
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// ROUTES ERROR HANDLING
app.all("*", (req, res, next) => {

  next(new appError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);


module.exports = app;
