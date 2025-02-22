import z from "zod";

export const apparelColor = z.object({
  color: z.string(),
  quantity: z.number(),
  price: z.number(),
});

export const apparelSize = z.object({
  size: z.string(),
  color: apparelColor.array(),
});

export const addApparelSchema = z.object({
  name: z.string(),
  totalQuantity: z.number(),
  variants: apparelSize.array(),
});



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


