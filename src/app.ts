import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express();

import { errorHandler } from "./app/middlewares/errorHandler";
import { authRouter } from "./app/modules/auth/auth.routes";
import { driverRouter } from "./app/modules/driver/driver.routes";
import { fareRouter } from "./app/modules/fare/fare.routes";
import { locationRouter } from "./app/modules/location/location.routes";
import { reportsRouter } from "./app/modules/reports/report.routes";
import { rideRouter } from "./app/modules/rider/ride.routes";
import { userRouter } from "./app/modules/user/user.routes";

app.use(express.json());

// CORS Options

const corsOptions = {
  origin: [
    "https://ride-sharing-pro.vercel.app",
    "https://ride-sharing-pro.surge.sh",
    "http://localhost:5173",
  ],
  credentials: true, // Allows credentials like cookies to be sent
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/rides", rideRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/location", locationRouter);
app.use("/api/fare", fareRouter);

// Error Handler
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Ride Booking System Backend",
  });
});

export default app;
