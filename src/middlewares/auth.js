const jwt = require('jsonwebtoken');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../errors/appError');

const auth = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(new AppError('Authentication Invalid', 400));
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { id: payload.userId };

    next();
  } catch (error) {
    return next(new AppError('Authentication Invalid', 400));
  }
});

module.exports = auth;
