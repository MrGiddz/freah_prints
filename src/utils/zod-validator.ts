import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";

const Validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error.errors)
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          errors: formattedErrors,
        });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };

export default Validate;
