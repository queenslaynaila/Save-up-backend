import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const port: number = parseInt(process.env.PORT as string, 10);
const server = http.createServer(app);
const io = new SocketIOServer(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinGroup', ({ room }, callback) => {
    socket.join(room);
    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    io.to(message.room).emit('message', { user: message.user, text: message.text });
    callback();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
