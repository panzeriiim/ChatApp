const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../errors/appError');
const User = require('../models/user.model');

exports.register = asyncWrapper(async (req, res, next) => {
  const { username, email, password, avatar } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Please Provide All Values', 400));
  }

  const isUserExists = await User.findOne({ email: email });

  if (isUserExists) {
    return next(new AppError('User with this Email Already Exists', 400));
  }

  //hashing password
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashPassword,
    avatar,
  });

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      userEmail: user.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(201).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    token,
  });
});
exports.login = asyncWrapper(async (req, res, next) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    return next(new AppError('Please Provide All the Values', 400));
  }

  const isUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (!isUser) {
    return next(new AppError('Invalid Credentials', 400));
  }

  //compare password
  const comparePassword = await bcrypt.compare(password, isUser.password);

  if (!comparePassword) {
    return next(
      new AppError('Please Make Sure You have entered Correct Password!', 400)
    );
  }

  const token = jwt.sign(
    {
      userId: isUser._id,
      username: isUser.username,
      userEmail: isUser.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  res.status(200).json({
    _id: isUser._id,
    username: isUser.username,
    email: isUser.email,
    avatar: isUser.avatar,
    token,
  });
});

exports.searchUser = asyncWrapper(async (req, res) => {
  const { search } = req.query;

  const user = await User.find({
    username: { $regex: search, $options: 'i' },
  }).select('username avatar _id email bio');

  res.status(200).json(user);
});
