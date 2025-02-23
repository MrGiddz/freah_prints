import { Request, Response } from "express";
import { canFulfillOrder, getLowestCostForOrder } from "./vendor.service";
import logger from "../../utils/logger";
import { AuthRequest } from "../../middleware/vendor.middleware";
import { findOrderById } from "../order/order.service";
import { getStockByCode } from "../apparel/apparel.service";

export const vendorCanFulfilOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const vendorId = req.vendor.id;

    if (!orderId) {
      return res.status(400).json({ message: "OrderId not specified" });
    }

    if (!vendorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Vendor ID missing" });
    }

    // Fetch the order
    const order = await findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify if the vendor owns any of the items in the order
    const vendorOwnsItem = await Promise.all(
      order.items.map(async (item) => {
        const apparel = await getStockByCode(item.apparelCode);
        return apparel?.added_by === vendorId;
      })
    );

    if (!vendorOwnsItem.includes(true)) {
      return res.status(403).json({
        message: "Unauthorized: Vendor does not own any items in this order",
      });
    }

    // Check if the vendor can fulfill the order
    const canFulfilOrder = await canFulfillOrder(orderId);

    return res.status(200).json({ canFulfilOrder });
  } catch (error) {
    logger.error("Error occurred while verifying order fulfillment", error);
    return res
      .status(500)
      .json({ error: "Error occurred while verifying order fulfillment" });
  }
};

export const lowestCostOfOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const vendorId = req.vendor.id;

    if (!orderId) {
      return res.status(400).json({ message: "OrderId not specified" });
    }

    if (!vendorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: Vendor ID missing" });
    }

    // Fetch the order
    const order = await findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify if the vendor owns any of the items in the order
    const vendorOwnsItem = await Promise.all(
      order.items.map(async (item) => {
        const apparel = await getStockByCode(item.apparelCode);
        return apparel?.added_by === vendorId;
      })
    );

    if (!vendorOwnsItem.includes(true)) {
      return res.status(403).json({
        message: "Unauthorized: Vendor does not own any items in this order",
      });
    }

    // Check if the vendor can fulfill the order
    // const canFulfilOrder = await canFulfillOrder(orderId);

    // if (!canFulfilOrder)
    //   res.status(405).json({ message: "Order cannot be fulfilled" });

    const lowestCost = await getLowestCostForOrder(orderId);

    console.log({ lowestCost });

    return res.status(200).json(lowestCost);
  } catch (error) {
    logger.error("Error occurred while verifying order fulfillment", error);
    return res
      .status(500)
      .json({ error: "Error occurred while verifying order fulfillment" });
  }
};
