import express, { Router } from "express";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import { formatZodErrors } from "@/utility/zod-error-formatter";

const router: Router = express.Router();

const CreateCategorySchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = CreateCategorySchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });

  const { name, description } = parsed.data;

  // Case-insensitive duplicate check
  const all = await prisma.category.findMany();

  const exists = all.find(
    (c: any) => c.name.toLowerCase() === name.toLowerCase(),
  );

  if (exists) return res.status(409).json({ error: "Category already exists" });

  const category = await prisma.category.create({
    data: { name, description },
  });

  return res.status(201).json({ category });
});

// GET / - list all categories (public)
router.get("/", requireAuth, async (_req, res) => {
  const categories = await prisma.category.findMany();

  return res.status(200).json({ categories });
});

export default router;
