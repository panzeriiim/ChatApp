const AppError = require('../errors/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!',
    });
  }
};
const invalidErrorHandlerDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const validationErrorHandlerDB = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  let message = `Wrong input data. ${value}`;
  message = message.replace('Path', 'field');
  return new AppError(message, 400);
};
const duplicateErrorHandlerDB = (err) => {
  const [field, value] = Object.entries(err.keyValue)[0];
  const message = `duplicated value at field ${field}. ${value} is used`;
  return new AppError(message, 400);
};
const handleInvalidJWTErr = () =>
  new AppError('Invalid Token, please log in again', 401);
const handlerExpiredJWTErr = () =>
  new AppError('Token is expired, please log in again', 401);
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = invalidErrorHandlerDB(err);
    else if (err.code === 11000) err = duplicateErrorHandlerDB(err);
    else if (err.name === 'ValidationError')
      err = validationErrorHandlerDB(err);
    else if (err.name === 'JsonWebTokenError') err = handleInvalidJWTErr();
    else if (err.name === 'TokenExpiredError') err = handlerExpiredJWTErr();
    sendErrorProd(err, res);
  }
};
module.exports = errorHandler;
