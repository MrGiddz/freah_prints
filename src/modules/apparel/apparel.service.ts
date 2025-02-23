import z from "zod";
import ApparelModel, { ApparelInt } from "../../models/apparel.model";
import {
  AddApparelType,
  ApparelSizeType,
  UpdateApparelSizeType,
} from "../../schemas";
import {
  generateApparelCode,
  generateSizeId,
} from "../../utils/generate-apparel-code";
import { Document } from "../../data/config/base-model";
import { HTTPError } from "../../utils/http-errors";
import logger from "../../utils/logger";

export const addStock = async (
  values: AddApparelType,
  added_by: string
): Promise<Document<ApparelInt>> => {
  try {
    const { name, variants } = values;

    const code = generateApparelCode(name);

    // Check if apparel with the same code already exists
    const existingApparel = await ApparelModel.findOne({ code });
    if (existingApparel) {
      throw new HTTPError({
        message: "An existing Apparel with that code already exists",
        statusCode: 409,
        cause: "Conflict",
      });
    }

    const updatedVariants = variants.map((variant) => {
      const sizeId = generateSizeId(variant.size);
      return {
        ...variant,
        sizeId,
      };
    });

    console.log({
      name,
      variants: updatedVariants,
      code,
      added_by,
    });

    const newApparel = await ApparelModel.create({
      name,
      variants: updatedVariants,
      code,
      added_by,
    });

    return newApparel;
  } catch (error) {
    console.error("Error adding apparel:", error);
    throw new HTTPError({
      message: "Internal Server Error",
      statusCode: 500,
      cause: "Conflict",
    });
  }
};

export const updateStock = async (
  code: string,
  name?: string,
  variants?: UpdateApparelSizeType[]
) => {
  const apparel = await ApparelModel.findOne({ code });

  console.log({ apparel, code });
  if (!apparel) {
    throw new HTTPError({
      message: "Apparel not found",
      statusCode: 404,
      cause: "Not Found",
    });
  }

  let updated = false;

  // Update apparel name if provided
  if (name && name !== apparel.name) {
    apparel.name = name;
    updated = true;
  }

  // Process size updates if provided
  if (variants && variants.length > 0) {
    const existingSizeIds = new Set(apparel.variants.map((v) => v.sizeId));

    apparel.variants = apparel.variants.map((existingVariant) => {
      const newVariant = variants.find(
        (v) => v.sizeId === existingVariant.sizeId
      );
      if (newVariant) {
        updated = true;
        return {
          ...existingVariant,
          size: newVariant.size || existingVariant.size,
        };
      }
      return existingVariant;
    });

    // Add new sizes if they don't exist
    const newSizes = variants.filter((v) => !existingSizeIds.has(v.sizeId));
    if (newSizes.length > 0) {
      updated = true;
      apparel.variants.push({ ...newSizes, price: 0 });
    }
  }

  // If no updates were made, return error
  if (!updated) {
    throw new HTTPError({
      message: "No updates were made",
      statusCode: 400,
      cause: "Bad Request",
    });
  }

  apparel.updatedAt = new Date().toISOString();

  try {
    const isUpdated = await ApparelModel.update({ code }, apparel);
    if (!isUpdated) {
      throw new HTTPError({
        message: "Failed to update apparel",
        statusCode: 400,
        cause: "Bad Request",
      });
    }
    return apparel;
  } catch (error) {
    logger.error(`Error updating apparel with code '${code}': ${error}`);
    throw new HTTPError({
      message: `Error updating apparel`,
      statusCode: 500,
      cause: "Internal Server Error",
    });
  }
};

/**
 * Updates stock for multiple apparel items at once.
 */
export const bulkUpdateStock = async (
  updates: {
    code: string;
    name: string;
    variants: ApparelSizeType[];
  }[]
): Promise<boolean> => {
  try {
    // Execute all stock updates concurrently
    await Promise.all(
      updates.map((update) =>
        updateStock(update.code, update.name, update.variants)
      )
    );

    return true;
  } catch (error) {
    console.error("Error in bulk updating stock:", error);
    return false;
  }
};

// Get all available stocks
export const getAllStock = async () => {
  return await ApparelModel.find();
};

// Get stock by apparel code
export const getStockByCode = async (code: string) => {
  const apparel = await ApparelModel.findOne({ code });
  if (!apparel) {
    throw new HTTPError({ message: "Apparel not found", statusCode: 404 });
  }
  return apparel;
};
