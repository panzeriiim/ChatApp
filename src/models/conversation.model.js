const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    conversationName: {
      type: String,
      trim: true,
    },
    isGroupConversation: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: mongoose.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
