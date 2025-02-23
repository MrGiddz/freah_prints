import { Request, Response } from "express";
import {
  addStock,
  bulkUpdateStock,
  getAllStock,
  getStockByCode,
  updateStock,
} from "./apparel.service";
import logger from "../../utils/logger";
import { JWTPayloadType } from "../../utils/generate-tokens";
import { AddApparelType } from "../../schemas";
import { HTTPError } from "../../utils/http-errors";

export const getAllApparel = async (req: Request, res: Response) => {
  const apparels = await getAllStock();

  return res.status(200).json(apparels);
};

export const getApparelByCode = async (req: Request, res: Response) => {
  const apparelCode = req.params.code;

  if (!apparelCode)
    return res.status(404).json({ message: "Apparel not found." });
  try {
    const apparels = await getStockByCode(apparelCode);
  
    return res.status(200).json(apparels);
    
  } catch (error) {
    if(error instanceof HTTPError) {
      logger.error(error.toJson)
      return res.json(error.statusCode).json(error.toJson())
    }
    logger.error(error)
    return res.status(500).json({error: "An error occured fetching apparel"})
  }
};

export const addApparel = async (
  req: Request & { vendor: JWTPayloadType },
  res: Response
) => {
  try {
    const { name, variants } = req.body as AddApparelType;
    const { id } = req.vendor;
    const apparel = await addStock({ name, variants }, id);

    return res.status(201).json(apparel);
  } catch (error) {
    if (error instanceof HTTPError) {
      logger.error(error.toJson());
      return res.status(error.statusCode).json(error.toJson());
    }
    logger.error("Error occured creating apparel", error);
    return res.status(500).json({ error: "Internal Server Error occured" });
  }
};

export const updateApparel = async (req: Request, res: Response) => {
  try {
    const { code, name, variants } = req.body;

    const success = await updateStock(code, name, variants);

    if (success) {
      return res.json({ message: "Stock updated successfully" });
    } else {
      return res.status(400).json({ message: "Failed to update stock" });
    }
  } catch (error) {
    console.log(error);
    if (error instanceof HTTPError) {
      logger.error("Error updating apparel:", error.toJson());
      return res.status(error.statusCode).json({ message: error.message });
    }

    logger.error("Error updating apparel:", error);
    return res.status(500).json({ error: "Internal Server Error occured" });
  }
};

export const bulkUpdateApparel = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const success = await bulkUpdateStock(updates);

    if (success) {
      return res.json({ message: "Bulk stock update successful" });
    } else {
      return res.status(400).json({ message: "One or more updates failed" });
    }
  } catch (error) {
    logger.error("Error in bulk stock update:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
