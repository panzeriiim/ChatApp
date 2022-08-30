const { StatusCodes } = require('http-status-codes');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../errors/appError');

exports.getConversation = asyncWrapper(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('No User Exists!', 404));
  }

  let conversation = await Conversation.find({
    isGroupConversation: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  conversation = await User.populate(conversation, {
    path: 'latestMessage.sender',
    select: 'username avatar email fullName _id',
  });

  if (conversation.length > 0) {
    res.send(conversation[0]);
  } else {
    const createConversation = await Conversation.create({
      conversationName: 'sender',
      isGroupConversation: false,
      users: [req.user.id, userId],
    });

    const fullConversation = await Conversation.findOne({
      _id: createConversation._id,
    }).populate('users', '-password');

    res.status(StatusCodes.OK).json(fullConversation);
  }
});

exports.getConversations = asyncWrapper(async (req, res) => {
  const conversation = await Conversation.find({
    users: { $elemMatch: { $eq: req.user.id } },
  })
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  const user = await User.populate(conversation, {
    path: 'latestMessage.sender',
    select: 'username avatar email fullName _id',
  });

  res.status(StatusCodes.OK).json(user);
});

exports.createGroup = asyncWrapper(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please Fill all the feilds' });
  }

  const users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return next(
      new AppError(
        'More than 2 users are required to form a group conversation',
        400
      )
    );
  }

  users.push(req.user.id);

  const groupConversation = await Conversation.create({
    conversationName: req.body.name,
    users: users,
    isGroupConversation: true,
    groupAdmin: req.user.id,
  });

  const fullGroupConversation = await Conversation.findOne({
    _id: groupConversation._id,
  })
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  res.status(200).json(fullGroupConversation);
});

exports.renameGroup = asyncWrapper(async (req, res, next) => {
  const { conversationId, conversationName } = req.body;

  const updateConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      conversationName: conversationName,
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updateConversation) {
    return next(new AppError('Conversation Not Found', 404));
  }
  res.json(updateConversation);
});

exports.addUserToGroup = asyncWrapper(async (req, res, next) => {
  const { conversationId, userId } = req.body;

  const addUser = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!addUser) {
    return next(new AppError('Conversation Not Found', 404));
  }
  res.status(StatusCodes.OK).json(addUser);
});

exports.removeFromGroup = asyncWrapper(async (req, res, next) => {
  const { conversationId, userId } = req.body;

  const removeUser = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!removeUser) {
    return next(new AppError('Conversation Not Found', 404));
  }
  res.status(StatusCodes.OK).json(removeUser);
});
