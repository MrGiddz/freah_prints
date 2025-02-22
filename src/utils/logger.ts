import pino from "pino";
import dayjs from "dayjs";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDirectory = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Log file path
const logFilePath = path.join(logDirectory, "app.log");

// Determine environment
const isProduction = process.env.NODE_ENV === "production";

// Configure logger
const logger = pino({
  transport: isProduction
    ? undefined
    : {
        targets: [
          { target: "pino-pretty" }, // Console output
          { 
            target: "pino/file", 
            options: { destination: logFilePath } // Log to file
          },
        ],
        options: {
          colorize: true,
          levelFirst: true,
          ignore: "pid,hostname",
          translateTime: "yyyy-mm-dd HH:MM:ss",
          messageFormat: "{msg}",
        },
      },
  base: { pid: false },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

logger.info("Logger initialized successfully.");

export default logger;
