import { Request, Response, Router } from "express";
import Validate from "../utils/zod-validator";
import { addApparelSchema, updateApparelSchema } from "../schemas";
import {
  authenticateVendor,
  AuthRequest,
} from "../middleware/vendor.middleware";
import {
  addApparel,
  getAllApparel,
  getApparelByCode,
  updateApparel,
} from "../modules/apparel/apparel.controller";

export default (router: Router) => {
  const apparel = Router();

  apparel.get("/", getAllApparel);

  apparel.post(
    "/add",
    Validate(addApparelSchema),
    authenticateVendor,
    (req: Request, res: Response) => addApparel(req as AuthRequest, res)
  );

  apparel.put(
    "/update",
    Validate(updateApparelSchema),
    authenticateVendor,
    updateApparel
  );

  apparel.get("/:code", getApparelByCode)

  router.use("/apparel", apparel);
};
