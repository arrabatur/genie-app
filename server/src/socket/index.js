const { v4: uuidv4 } = require('uuid');
const { messages, users } = require('../data/mockData');

const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Authenticate user
    socket.on('auth', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // Join all user's conversation rooms
      const allConvIds = Object.keys(messages);
      allConvIds.forEach((convId) => socket.join(convId));

      // Broadcast online status
      socket.broadcast.emit('user:online', { userId });
      console.log(`User ${userId} authenticated`);
    });

    // Send message
    socket.on('message:send', ({ conversationId, content, type = 'text', imageUrl, duration }) => {
      const senderId = socket.userId;
      if (!senderId) return;

      const msg = {
        id: uuidv4(),
        conversationId,
        senderId,
        content: content ?? '',
        type,
        createdAt: new Date().toISOString(),
        read: false,
        ...(imageUrl && { imageUrl }),
        ...(duration && { duration }),
      };

      // Persist to in-memory store
      if (!messages[conversationId]) messages[conversationId] = [];
      messages[conversationId].push(msg);

      // Broadcast to all participants in the conversation
      io.to(conversationId).emit('message:new', msg);
    });

    // Mark messages as read
    socket.on('message:read', ({ conversationId }) => {
      const userId = socket.userId;
      if (!messages[conversationId]) return;

      messages[conversationId] = messages[conversationId].map((m) =>
        m.senderId !== userId ? { ...m, read: true } : m
      );
      socket.to(conversationId).emit('messages:read', { conversationId, readBy: userId });
    });

    // Typing indicator
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:start', {
        conversationId, userId: socket.userId,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop', {
        conversationId, userId: socket.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        socket.broadcast.emit('user:offline', { userId: socket.userId });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
