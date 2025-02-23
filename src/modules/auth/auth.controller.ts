import { Request, Response } from "express";
import UserModel, { User } from "../../models/user.model";
import logger from "../../utils/logger";
import generateTokens from "../../utils/generate-tokens";
import { createVendor, doLogin } from "./auth.service";
import { HTTPError } from "../../utils/http-errors";

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

    const isEmailExists = await UserModel.findOne({ email });
    if (isEmailExists) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const user = await createVendor(name, email, password);

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

    const tokens = await doLogin(email, password);
    console.log({tokens})
    return res.status(200).json(tokens)

  } catch (error) {
    if (error instanceof HTTPError) {
      logger.error(error.toJson());
      return res.status(error.statusCode).json(error.toJson());
    }
    logger.error(error);
    return res.status(500).json({ error: "An internal server error occured" });
  }
};
