import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";

let io: SocketIOServer;

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: [
        "https://ride-sharing-pro.netlify.app",
        "http://localhost:5173",
        "https://ride-sharing-pro.vercel.app",
        "https://ride-sharing-pro.surge.sh",
      ],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join role-based rooms
    socket.join(socket.userRole);
    socket.join(`user_${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

declare module "socket.io" {
  interface Socket {
    userId: string;
    userRole: string;
  }
}