import z from "zod";


export const apparelSize = z.object({
  size: z.string(),
  sizeId: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be at least 0"),
  price: z.number().min(0, "Price must be at least 0"),
});

export type ApparelSizeType = z.infer<typeof apparelSize>;

export const addApparelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  variants: z.array(apparelSize),
});

export type AddApparelType = z.infer<typeof addApparelSchema>;


export const updateApparelSize = z.object({
  size: z.string().optional(),
  sizeId: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be at least 0").optional(),
  price: z.number().min(0, "Price must be at least 0").optional(),
});

export type UpdateApparelSizeType = z.infer<typeof updateApparelSize>;


export const updateApparelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  variants: z.array(updateApparelSize).optional(),
});

export type UpdateApparelType = z.infer<typeof updateApparelSchema>;


export const orderItemsSchema = z.object({
  apparelCode: z.string(),
  sizeId: z.string(),
  quantity: z.number(),
  vendorId: z.string()
});

export const setOrderSchema = z.object({
  items: z.array(orderItemsSchema),
  customerName: z.string(),
});

export type SetOrderType = z.infer<typeof setOrderSchema>;


export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});
