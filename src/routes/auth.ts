import { Router } from "express";
import Validate from "../utils/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { login, register } from "../modules/auth/auth.controller";

export default (router: Router) => {
  const auth = Router();

  auth.post("/register", Validate(registerSchema), register);
  auth.post("/login", Validate(loginSchema), login);

  router.use("/auth", auth);
};
