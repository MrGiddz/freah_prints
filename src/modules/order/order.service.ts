import ApparelModel from "../../models/apparel.model";
import OrderModel, { CustomerOrder } from "../../models/orders.model";
import { HTTPError } from "../../utils/http-errors";
import logger from "../../utils/logger";
import { getStockByCode } from "../apparel/apparel.service";

/**
 * 
 * @param items 
 *   customerName?: string;
   items: OrderItem[];
   totalPrice: number;
   status: "pending" | "fulfilled" | "canceled";
 }
 * @returns 
 */

// Place order
export const placeOrder = async (order: CustomerOrder) => {
  const items = order.items;
  const errors: string[] = [];
  let totalPrice = 0;

  for (const item of items) {
    const apparel = await ApparelModel.findOne({ code: item.apparelCode });

    if (!apparel) {
      errors.push(`Apparel with code '${item.apparelCode}' not found.`);
      continue;
    }

    const sizeVariant = apparel.variants.find(
      (variant) => variant.sizeId === item.sizeId
    );

    if (!sizeVariant) {
      errors.push(
        `Size '${item.sizeId}' not found for apparel code '${item.apparelCode}'.`
      );
      continue;
    }

    if (sizeVariant.quantity && sizeVariant.quantity < item.quantity) {
      errors.push(
        `Insufficient stock for apparel code '${item.apparelCode}', size '${item.sizeId}'. Available: ${sizeVariant.quantity}, Requested: ${item.quantity}`
      );
      continue;
    }

    // Calculating total price
    totalPrice += sizeVariant.price * item.quantity;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const newOrder = await OrderModel.create({
    customerName: order.customerName,
    items: order.items,
    totalPrice,
    status: "pending",
  });

  return { success: true, order: newOrder };
};

export const findOrderById = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);
  return order;
};

export const findOrderByVendorItems = async (vendorId: string) => {
  const orders = await OrderModel.find();

  const filteredOrders = await Promise.all(
    orders.map(async (order) => {
      const filteredItems = [];

      for (const item of order.items) {
        try {
          const apparel = await getStockByCode(item.apparelCode);
          if (apparel && apparel.added_by === item.vendorId) {
            filteredItems.push(item);
          }
        } catch (error) {
          if (error instanceof HTTPError) {
            logger.error(error.toJson());
          }
        }
      }

      if (filteredItems.length > 0) {
        return { ...order, items: filteredItems };
      }

      return null;
    })
  );

  console.log({ filteredOrders });

  return filteredOrders.filter((order) => order !== null);
};
