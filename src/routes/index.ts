import { Router } from "express";
import apparel from "./apparel";
import auth from "./auth";

const router = Router();

export default (): Router => {
  apparel(router);
  auth(router);
  return router;
};
