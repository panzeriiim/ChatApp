/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = require('./app');

const PORT = process.env.PORT || 3000;
dotenv.config({ path: './.env' });

mongoose
  .connect(process.env.CONNECT_STRING)
  .then(() => {
    console.log('conection to database successfully');
  })
  .catch((err) => {
    console.log('something went wrong!!', err);
  });
const server = app.listen(PORT, () => {
  console.log('server is on port 3000!');
});
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  //connected to correct id
  socket.on('setup', (userData) => {
    socket.join(userData._id);

    socket.emit('connected');
  });

  socket.on('join-chat', (room) => {
    socket.join(room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing'));

  socket.on('new-message', (newMessageReceived) => {
    const { chat } = newMessageReceived;

    if (!chat.users) return console.log(`chat.users not defined`);

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit('message-received', newMessageReceived);
    });
  });

  socket.off('setup', () => {
    // eslint-disable-next-line no-undef
    socket.leave(userData._id);
  });
});
