import jwt from "jsonwebtoken";
import { AUTH_REFRESH_SECRET_KEY, AUTH_SECRET_KEY } from "./config";
import { UserInt } from "../models/user.model";

export interface JWTPayloadType {
  id: string;
  email: string;
}

const generateTokens = (user: UserInt) => {
  if (user.id) {
    const jwtUserPayload: JWTPayloadType = {
      id: user.id,
      email: user.email,
    };

    const accessTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    const accessToken = jwt.sign(jwtUserPayload, AUTH_SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(jwtUserPayload, AUTH_REFRESH_SECRET_KEY, {
      expiresIn: "7d",
    });

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  return null;
};

export default generateTokens;
