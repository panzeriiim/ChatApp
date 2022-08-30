const express = require('express');
const rateLimiter = require('express-rate-limit');
const authenticate = require('../middlewares/auth');

const router = express.Router();
const {
  register,
  login,
  searchUser,
} = require('../controllers/auth.controller');

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message:
    'Too many requests from this device, please try again after 15 minutes',
});

router.route('/register').post(apiLimiter, register);
router.route('/login').post(apiLimiter, login);
router.route('/users').get(authenticate, searchUser);

module.exports = router;
