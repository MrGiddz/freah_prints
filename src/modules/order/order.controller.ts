import { Request, Response } from "express";
import { SetOrderType } from "../../schemas";
import { findOrderByVendorItems, placeOrder } from "./order.service";
import logger from "../../utils/logger";
import { AuthRequest } from "../../middleware/vendor.middleware";
import { HTTPError } from "../../utils/http-errors";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, items } = req.body as SetOrderType;

    const apparel = await placeOrder({ customerName, items });

    return res.status(201).json(apparel);
  } catch (error) {
    logger.error("Error occured creating apparel", error);
    return res.status(500).json({ error: "Internal Server Error occured" });
  }
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  const vendorId = req.vendor.id;

  console.log({ vendorId });
  if (!vendorId)
    return res
      .status(403)
      .json({ error: "You are not authorized to perform this request" });

  try {
    const orders = await findOrderByVendorItems(vendorId);

    return res.status(200).json(orders);
  } catch (error) {
    if (error instanceof HTTPError) {
      logger.error(error.toJson());
      return res.status(error.statusCode).json(error.toJson());
    }
    logger.error(error);
    return res.status(500).json({ error: "Unable to fetch orders" });
  }
};
