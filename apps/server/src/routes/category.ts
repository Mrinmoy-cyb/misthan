import express, { Router } from "express";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import { formatZodErrors } from "@/utility/zod-error-formatter";

const router: Router = express.Router();

/**
 * Schema for creating a category.
 * - `name` is required and must be a non-empty string.
 * - `description` is optional.
 */
const CreateCategorySchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

/**
 * POST /api/category
 * - Requires authentication and admin privileges.
 * - Validates the payload with Zod and returns detailed validation errors
 *   using `formatZodErrors`.
 * - Performs a case-insensitive duplicate check before creating the
 *   category (returns 409 on conflict).
 */
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = CreateCategorySchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });

  const { name, description } = parsed.data;

  // Case-insensitive duplicate check: fetch all categories and compare
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

/**
 * GET /api/category
 * - Returns a list of all categories.
 * - Authentication is required so clients must be logged in to view
 *   available categories.
 */
router.get("/", requireAuth, async (_req, res) => {
  const categories = await prisma.category.findMany();

  return res.status(200).json({ categories });
});

export default router;
