import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { connectRedis } from "./utils/redisClient";

import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";

const app = express();

mongoose
  .connect(config.get<string>("mongo.url"))
  .then(() => {
    console.log("Database Connected!");
    // start server and redis when database connected
    Server();
  })
  .catch((error: any) => error.message);

const Server = () => {
  app.use(express.json());
  app.use(cookieParser());
  if (config.get<string>("server.node_env") === "development")
    app.use(morgan("dev"));
  app.use(
    cors({
      origin: config.get<string>("server.origin"),
      credentials: true,
    })
  );

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);

  //   Testing route
  app.get("/testing", (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "Hello from nubicoder" });
  });

  // Error Handling
  // Unknown routes
  app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });
  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  });

  app.listen(config.get<number>("server.port"), () => {
    console.log(
      `Server started. running on part ${config.get<number>("server.port")}`
    );
    connectRedis();
  });
};
