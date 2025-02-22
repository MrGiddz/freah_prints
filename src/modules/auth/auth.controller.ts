import { Request, Response } from "express";
import UserModel, { User } from "../../models/user.model";
import logger from "../../utils/logger";
import generateTokens from "../../utils/generate-tokens";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, password, email } = req.body;

    // Validate input
    if (!name || !password || !email) {
      return res
        .status(400)
        .json({ error: "The data you provided is invalid, please check." });
    }

    // Another validation for password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be at least 8 characters long." });
    }

    const isNameExists = await UserModel.findOne({ name });
    if (isNameExists) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const user = await UserModel.create({ name, password, email });

    return res.status(201).json({ user });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred. Please try again later." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = await UserModel.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    const isPasswordMatch = user.comparePassword(password);

    if (!isPasswordMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    const tokens = generateTokens(user);

    user.setRefreshToken(tokens.refreshToken, tokens.refreshTokenExpiresAt);

    return res.status(201).json({ user, ...tokens });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ error: "An Error occurred, please try again." });
  }
};
