import { Request, Response } from "express";
import {
  bulkUpdateStock,
  canFulfillOrder,
  getLowestFulfillmentCost,
  updateStock,
} from "./apperel.service";
import logger from "../../utils/logger";

export const updateApparel = async (req: Request, res: Response) => {
  try {
    const { code, sizeId, color, quantity, price } = req.body;
    const success = await updateStock(code, sizeId, color, quantity, price);
    if (success) {
      res.json({ message: "Stock updated successfully" });
    } else {
      res.status(400).json({ message: "Failed to update stock" });
    }
  } catch (error) {

    logger.error(error);
  }
};

export const bulkUpdateApparel = (req: Request, res: Response) => {
  const updates = req.body;
  const success = bulkUpdateStock(updates);
  if (success) {
    res.json({ message: "Bulk stock update successful" });
  } else {
    res.status(400).json({ message: "One or more updates failed" });
  }
};

export const canFulfilOrder = (req: Request, res: Response) => {
  const order = req.body;
  const canFulfill = canFulfillOrder(order);
  res.json({ canFulfill });
};

export const lowestFulfilmentCost = (req: Request, res: Response) => {
  const order = req.body;
  const cost = getLowestFulfillmentCost(order);
  if (cost !== null) {
    res.json({ totalCost: cost });
  } else {
    res.status(400).json({ message: "Order cannot be fulfilled" });
  }
};
