import ApparelModel from "../../models/apparel.model";
import UserModel, { UserInt } from "../../models/user.model";
import generateTokens from "../../utils/generate-tokens";
import bcrypt from "bcrypt";
import logger from "../../utils/logger";

export const createVendor = async (
  name: string,
  email: string,
  password: string
): Promise<boolean> => {
  // Ensure we wait for the database query to complete
  const isEmailExists = await UserModel.findOne({ email });

  if (isEmailExists) throw new Error("Email already exists.");

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user with the hashed password
  await UserModel.create({ name, email, password: hashedPassword });

  return true;
};

export async function getUserById(userId: string) {
  return await UserModel.findById(userId);
}

/**
 * Logs in vendor
 */
export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("nvalid email or password");
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) throw new Error("Invalid username or password");

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) throw new Error("Invalid credentials");

    const tokens = generateTokens(user);

    user.setRefreshToken(tokens.refreshToken, tokens.refreshTokenExpiresAt);

    return tokens;
  } catch (error) {
    logger.error(error);
    throw new Error("An Error occurred, please try again.");
  }
};

/**
 * Checks if an order can be fulfilled.
 */
export const canFulfillOrder = async (
  order: { code: string; sizeId: string; color: string; quantity: number }[]
) => {
  return order.every(async ({ code, sizeId, color, quantity }) => {
    const apparel = await ApparelModel.findOne({ code });
    if (!apparel) return false;

    const size = apparel.variants.find((s) => s.sizeId === sizeId);
    if (!size) return false;

    const colorVariant = size.colors.find((c) => c.color === color);
    return colorVariant && colorVariant.quantity >= quantity;
  });
};

/**
 * Calculates the lowest cost to fulfill an order.
 */
export const getLowestFulfillmentCost = async (
  order: { code: string; sizeId: string; color: string; quantity: number }[]
) => {
  let totalCost = 0;

  for (const { code, sizeId, color, quantity } of order) {
    const apparel = await ApparelModel.findOne({ code });
    if (!apparel) return null;

    const size = apparel.variants.find((s) => s.sizeId === sizeId);
    if (!size) return null;

    const colorVariant = size.colors.find((c) => c.color === color);
    if (!colorVariant || colorVariant.quantity < quantity) return null;

    totalCost += colorVariant.price * quantity;
  }

  return totalCost;
};
