import ApparelModel from "../../models/apparel.model";
import UserModel, { UserDocument, UserInt } from "../../models/user.model";
import generateTokens from "../../utils/generate-tokens";
import bcrypt from "bcrypt";
import logger from "../../utils/logger";
import { HTTPError } from "../../utils/http-errors";

export const createVendor = async (
  name: string,
  email: string,
  password: string
): Promise<UserDocument> => {
  const user = await UserModel.create({
    name,
    email,
    password,
  });

  return user;
};

export async function getUserById(userId: string) {
  return await UserModel.findById(userId);
}

/**
 * Logs in vendor
 */
export const doLogin = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("invalid email or password");
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new HTTPError({
        message: "Username or password incorrect",
        statusCode: 403,
        cause: "Invalid credentials",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch)
      throw new HTTPError({
        message: "Username or password incorrect",
        statusCode: 403,
        cause: "Invalid credentials",
      });

    const tokens = generateTokens(user);

    // if (!tokens) throw new Error("A login error has occured");
    if (!tokens)
      throw new HTTPError({
        message: "Error occurred while logging in",
        statusCode: 500,
        cause: "Internal Server Error",
      });

    if (tokens)
      user.setRefreshToken(tokens.refreshToken, tokens.refreshTokenExpiresAt);

    return { ...user, ...tokens };
  } catch (error) {
    logger.error(error);
    throw new HTTPError({
      message: "An Error occurred, please try again.",
      statusCode: 500,
      cause: "Internal Server Error",
    });
  }
};
