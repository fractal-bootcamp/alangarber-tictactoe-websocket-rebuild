const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'https://tictactoe-old-ephraims-projects.vercel.app',
  }
});

// Keep track of players waiting for a match
const waitingPlayers = [];

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle matchmaking
  socket.on('findMatch', () => {
    console.log(`Player ${socket.id} is looking for a match`);

    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.pop();
      const roomId = `${opponent.id}#${socket.id}`;

      socket.join(roomId);
      opponent.join(roomId);

      io.to(roomId).emit('matchFound', { roomId, players: [socket.id, opponent.id] });
      console.log(`Match found between ${opponent.id} and ${socket.id}`);
    } else {
      waitingPlayers.push(socket);
      socket.emit('waiting');
      console.log(`No match yet. Player ${socket.id} is waiting.`);
    }
  });

  // Handle moves
  socket.on('playerMove', (data) => {
    console.log('Move received:', data);
    socket.broadcast.emit('playerMove', data); // In a real app, you might want to broadcast within the room only
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove disconnected player from waiting list if they were waiting
    const index = waitingPlayers.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      console.log(`Player ${socket.id} removed from waiting list`);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
