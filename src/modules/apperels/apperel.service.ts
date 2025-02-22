import ApparelModel from "../../models/apparel.model";

export const updateStock = async (
  code: string,
  sizeId: string,
  color: string,
  quantity: number,
  price: number
) => {
  const apparel = await ApparelModel.findOne({ code });
  if (!apparel) return false;

  let updated = false;

  apparel.variants.forEach((size) => {
    if (size.sizeId === sizeId) {
      size.colors.forEach((col) => {
        if (col.color === color) {
          col.quantity = quantity;
          col.price = price;
          updated = true;
        }
      });
    }
  });

  if (updated) {
    apparel.totalQuantity = apparel.variants.reduce(
      (sum, size) =>
        sum + size.colors.reduce((colSum, col) => colSum + col.quantity, 0),
      0
    );
    apparel.updatedAt = new Date().toISOString();
    return ApparelModel.update({ code }, apparel);
  }

  return false;
};

/**
 * Updates stock for multiple apparel items at once.
 */
export const bulkUpdateStock = (
  updates: {
    code: string;
    sizeId: string;
    color: string;
    quantity: number;
    price: number;
  }[]
): boolean => {
  let success = true;
  updates.forEach((update) => {
    if (
      !updateStock(
        update.code,
        update.sizeId,
        update.color,
        update.quantity,
        update.price
      )
    ) {
      success = false;
    }
  });
  return success;
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
