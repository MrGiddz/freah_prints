import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { PORT } from "./utils/config";
import logger from "./utils/logger";

/* CONFIGURATION */
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Logs the request and response activities
app.use((req: Request, res: Response, next: NextFunction) => {
  const { method, url, hostname, protocol } = req;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const timestamp = new Date().toISOString();

  logger.info(
    `[${timestamp}] ${method} - ${protocol.toUpperCase()} - ${hostname} - ${url} - ClientIP: ${ip} - Request received`
  );

  res.on("finish", () => {
    const responseTime = new Date().toISOString();
    const { statusCode } = res;
    logger.info(
      `[${responseTime}] ${method} - ${protocol.toUpperCase()} - ${hostname} - ${url} - ClientIP: ${ip} - Response sent with status ${statusCode}`
    );
  });

  next();
});

// Handle JSON Syntax Errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    const { method, url, hostname, protocol } = req;
    const statusCode = 400;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const timestamp = new Date().toISOString();

    logger.info(
      `[${timestamp}] ${method} - ${protocol.toUpperCase()} - ${hostname} - ${url} - ClientIP: ${ip} - Invalid JSON format. Ensure all keys are double-quoted. statusCode -${statusCode}`
    );
    return res.status(statusCode).json({
      success: false,
      error: "Invalid JSON format. Ensure all keys are double-quoted.",
    });
  }
  next();
});

/* ROUTES */
app.use("/api", routes());

// General 404 error handling
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

// General Error Handler
app.use((err: any, req: Request, res: Response) => {
  logger.error(err);
  logger.error(`Error: ${err.message}`);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

const server = app.listen(PORT, () => {
  logger.info(`server listening on ${PORT}`);
});

/* Graceful Shutdown Handling */
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  try {
    server.close(() => {
      logger.info("Server closed.");
    });

    logger.info("Cleanup finished. Exiting...");
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error}`);
    process.exit(1);
  }
};

/* Handle Process Kill Signals */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error}`);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  logger.error(`⚠️ Unhandled Promise Rejection: ${reason}`);
  shutdown("unhandledRejection");
});

export default app;
