// import express, { Request, Response } from "express";

// const app = express();

// app.get("/", (req: Request, res: Response) => {
//   res.status(200).json({
//     message: "Welcome to Ride Booking System Backend",
//   });
// });

// export default app;

import express, { Request, Response } from "express";

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
