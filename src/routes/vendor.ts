import { Request, Response, Router } from "express";
import Validate from "../utils/zod-validator";
import { setOrderSchema } from "../schemas";

import { createOrder, getVendorOrders } from "../modules/order/order.controller";
import { vendorCanFulfilOrder } from "../modules/vendor/vendor.controller";
import { authenticateVendor, AuthRequest } from "../middleware/vendor.middleware";

export default (router: Router) => {
  const vendor = Router();

  vendor.get("/can-fulfil-order", Validate(setOrderSchema), authenticateVendor, (req: Request , res: Response) => vendorCanFulfilOrder(req as AuthRequest, res));
  vendor.get("/orders", authenticateVendor, (req: Request , res: Response) => getVendorOrders(req as AuthRequest, res));



  router.use("/vendor", vendor);
};
