import { Router } from "express";
import Validate from "../utils/zod-validator";
import { addApparelSchema } from "../schemas";
import { authenticateVendor } from "../middleware/vendor.middleware";
import { updateApparel } from "../modules/apperels/apperel.controller";

export default (router: Router) => {
  const apparel = Router();

  apparel.put(
    "/update",
    Validate(addApparelSchema),
    authenticateVendor,
    updateApparel
  );

  router.use("/apparel", apparel);
};
