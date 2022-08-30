const Message = require('../models/message.model');
const User = require('../models/user.model');
const Chat = require('../models/conversation.model');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../errors/appError');

exports.sendMessage = asyncWrapper(async (req, res, next) => {
  const { message, chatId } = req.body;

  if (!message || !chatId) {
    return next(new AppError('Please Provide All Fields To send Message', 400));
  }

  const newMessage = {
    sender: req.user.id,
    message: message,
    chat: chatId,
  };

  let m = await Message.create(newMessage);

  m = await m.populate('sender', 'username avatar');
  m = await m.populate('chat');
  m = await User.populate(m, {
    path: 'chat.users',
    select: 'username avatar email _id',
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: m }, { new: true });

  res.status(200).json(m);
});

exports.allMessages = asyncWrapper(async (req, res) => {
  const { chatId } = req.params;

  const getMessage = await Message.find({ chat: chatId })
    .populate('sender', 'username avatar email _id')
    .populate('chat');

  res.status(200).json(getMessage);
});
