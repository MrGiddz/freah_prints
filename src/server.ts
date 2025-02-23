import app from "./app";
import { PORT } from "./utils/config";
import logger from "./utils/logger";

const server = app.listen(PORT, () => {
    logger.info(`server listening on ${PORT}`);
  });
  
  export const closeServer = () => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
      logger.info("Server closed.");
    });
  };
  
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