const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const authenticate = require('./src/middlewares/auth');
const authRoutes = require('./src/routes/auth.route');
const messageRoutes = require('./src/routes/message.route');
const conversationRoutes = require('./src/routes/conversation.route');

const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', authenticate, conversationRoutes);
app.use('/api/v1/message', authenticate, messageRoutes);
app.use(errorHandler);
module.exports = app;
