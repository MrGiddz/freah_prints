import { Router } from "express";
import Validate from "../utils/zod-validator";
import { setOrderSchema } from "../schemas";

import { createOrder } from "../modules/order/order.controller";

export default (router: Router) => {
  const order = Router();

  order.post("/create-single-order", Validate(setOrderSchema), createOrder);

  router.use("/order", order);
};
