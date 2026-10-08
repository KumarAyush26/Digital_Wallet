let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client joins a private room named by their userId
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`🔌 Socket client ${socket.id} joined user room: user_${userId}`);
      }
    });

    // Admin joins admin channel
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`🔌 Socket client ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

// Send real-time notification to a specific user
const emitToUser = (userId, eventName, payload) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(eventName, payload);
  }
};

// Broadcast alert to admin room
const emitToAdmin = (eventName, payload) => {
  if (ioInstance) {
    ioInstance.to('admin_room').emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToAdmin
};
