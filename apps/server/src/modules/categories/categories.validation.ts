import { z } from "zod";
import { nameSchema, hexColorSchema } from "@/common/validators";

export const createCategorySchema = z.object({
  name: nameSchema,
  icon: z.string().min(1).max(50).optional(),
  color: hexColorSchema.optional(),
});

export const updateCategorySchema = z.object({
  name: nameSchema.optional(),
  icon: z.string().min(1).max(50).optional(),
  color: hexColorSchema.optional(),
});
