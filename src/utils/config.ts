import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

// function to check required environment variables
// If any of the environment variables passed does not exist, the application will shutdown gracefully to ensure that the application runs smoothly. And has no reason to crash due to unset variables.
const checkRequiredEnvVars = (vars: string[]) => {
  let missingVars: string[] = [];

  vars.forEach((variable) => {
    if (!process.env[variable]) {
      missingVars.push(variable);
    }
  });

  if (missingVars.length > 0) {
    logger.error(
      `Missing required environment variables: ${missingVars.join(
        ", "
      )} \nPlease ensure that the environment variables are set then restart the application.`
    );

    // Exit the process gracefully
    process.exit(1);
  }
};

// Load environment variables
export const PORT = Number(process.env.PORT) || 9000;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY as string;
export const AUTH_REFRESH_SECRET_KEY = process.env.AUTH_REFRESH_SECRET_KEY as string;
export const VENDOR_SECRET_KEY = process.env.VENDOR_SECRET_KEY as string;

checkRequiredEnvVars([
  "ENCRYPTION_KEY",
  "PORT",
  "VENDOR_SECRET_KEY",
  "AUTH_SECRET_KEY",
  "AUTH_REFRESH_SECRET_KEY",
]);
