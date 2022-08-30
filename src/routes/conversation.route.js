const express = require('express');
const {
  getConversation,
  getConversations,
  createGroup,
  renameGroup,
  removeFromGroup,
  addUserToGroup,
} = require('../controllers/conversation.controller');

const router = express.Router();

router.route('/').post(getConversation).get(getConversations);
router.route('/createGroup').post(createGroup);
router.route('/renameGroup').patch(renameGroup);
router.route('/removeFromGroup').patch(removeFromGroup);
router.route('/addUserToGroup').patch(addUserToGroup);

module.exports = router;
