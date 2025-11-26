import { getIO } from "../../config/socket";

export class SocketService {
  static emitToAdmin(event: string, data: any) {
    try {
      const io = getIO();
      io.to("admin").emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }

  static emitToUser(userId: string, event: string, data: any) {
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }

  static emitToRole(role: string, event: string, data: any) {
    try {
      const io = getIO();
      io.to(role).emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }
}
