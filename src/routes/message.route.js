const express = require('express');

const router = express.Router();
const {
  allMessages,
  sendMessage,
} = require('../controllers/message.controller');

router.route('/:chatId').get(allMessages);
router.route('/').post(sendMessage);

module.exports = router;
