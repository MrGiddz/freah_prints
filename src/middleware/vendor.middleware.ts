import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { AUTH_SECRET_KEY } from "../utils/config";
import { JWTPayloadType } from "../utils/generate-tokens";
import UserModel from "../models/user.model";

export interface AuthRequest extends Request {
  vendor: JWTPayloadType;
}

// Middleware to authenticate the vendor
export const authenticateVendor = async (
  req: Request & { vendor?: JWTPayloadType },
  res: Response,
  next: NextFunction
) => {
  // Extract token from headers
  const token = req.headers["x-vendor-token"] as string;
  // Check if token is missing
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "No token provided",
    });
  }

  jwt.verify(token, AUTH_SECRET_KEY, async (err, decoded) => {
    if (err) {
      logger.error(`Token verification error: ${err.message}`);
      return res.status(403).json({ error: "Forbidden", message: err.message });
    }

    // Ensure decoded data is of type JWTPayloadType
    const userData = decoded as JWTPayloadType;

    if (userData && userData.id) {
      // check if the id exists and reject the user if not.
      const isExistingUser = await UserModel.findById(userData.id);
      if (!isExistingUser)
        return res.status(403).json({ message: "You are not authorized" });
      req.vendor = userData;
      return next();
    }

    const errorMessage = "Invalid token payload";
    logger.error(errorMessage);
    return res.status(403).json({ error: "Forbidden", message: errorMessage });
  });
};
