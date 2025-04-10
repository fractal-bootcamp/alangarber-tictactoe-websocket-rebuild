const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'https://tictactoe-hgj6h7sjf-old-ephraims-projects.vercel.app',
}
});

// Basic connection handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('playerMove', (data) => {
    console.log('Move received:', data);
    socket.broadcast.emit('playerMove', data); // Broadcast move to other player
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});