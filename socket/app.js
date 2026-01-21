import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  const exists = onlineUsers.find((u) => u.userId === userId);
  if (!exists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((u) => u.userId === userId);
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
