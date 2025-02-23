import { HTTPError } from "../../utils/http-errors";
import { getStockByCode } from "../apparel/apparel.service";
import { findOrderById } from "../order/order.service";

// Check if an order can be fulfilled
export const canFulfillOrder = async (orderId: string) => {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new HTTPError({ message: "Order not found", statusCode: 404 });
  }

  for (const item of order.items) {
    const apparel = await getStockByCode(item.apparelCode);
    if (!apparel) return false;

    const variant = apparel.variants.find((v) => v.sizeId === item.sizeId);
    if (!variant) return false;

    return variant.quantity && variant.quantity < item.quantity;
  }

  return false;
};

// Get the lowest cost to fulfill an order
export const getLowestCostForOrder = async (orderId: string) => {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new HTTPError({ message: "Order not found", statusCode: 404 });
  }

  let totalCost = 0;
  for (const item of order.items) {
    const apparel = await getStockByCode(item.apparelCode);
    if (!apparel) {
      throw new HTTPError({
        message: `Item with code ${item.apparelCode} not found`,
        statusCode: 404,
      });
    }

    const variant = apparel.variants.find((v) => v.sizeId === item.sizeId);
    if (!variant) {
      throw new HTTPError({
        message: `Size ${item.sizeId} not available`,
        statusCode: 400,
      });
    }

    totalCost += variant.price * item.quantity;
  }

  return totalCost;
};
