import { Router } from "express";
import { authenticateAccess } from "../../middlewares/auth.middleware";
import { SocketService } from "./socket.service";

export const socketRouter = Router();

// Test endpoint to send notifications
socketRouter.post("/test-notification", authenticateAccess, (req: any, res) => {
  const { type, message } = req.body;

  if (type === "admin") {
    SocketService.emitToAdmin("test_notification", {
      message: message || "Test admin notification",
      timestamp: new Date(),
    });
  } else if (type === "user") {
    SocketService.emitToUser(req.user.userId, "test_notification", {
      message: message || "Test user notification",
      timestamp: new Date(),
    });
  }

  res.json({ success: true, message: "Test notification sent" });
});
