import { Router } from "express";
import apparel from "./apparel";
import auth from "./auth";
import orders from "./orders";
import vendor from "./vendor";

const router = Router();

export default (): Router => {
  apparel(router);
  auth(router);
  orders(router);
  vendor(router);
  return router;
};
