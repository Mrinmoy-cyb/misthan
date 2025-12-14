import express, { Router } from "express";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/middleware/auth";
import { formatZodErrors } from "@/utility/zod-error-formatter";

const router: Router = express.Router();

const CreateSweetSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(1, { message: "Name is required" }),
  price: z
    .number({ error: "Price is required" })
    .nonnegative({ message: "Price must be non-negative" }),
  stock: z
    .number({ error: "Stock is required" })
    .int({ message: "Stock must be an integer" })
    .nonnegative({ message: "Stock must be non-negative" }),
  categoryId: z
    .string({ error: "Category ID is required" })
    .min(1, { message: "Category ID is required" }),
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = CreateSweetSchema.safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });

  const { name, price, stock, categoryId } = parsed.data;

  // ensure category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId } as any,
  });

  if (!category) return res.status(400).json({ error: "Invalid category" });

  const sweet = await prisma.sweet.create({
    data: { name, price, stock, categoryId, userId: (req as any).user.id },
  });

  return res.status(201).json({ sweet });
});

// Update a sweet - only admin and only the creator can update
const UpdateSweetSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    categoryId: z.string().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "At least one field is required",
  });

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = UpdateSweetSchema.safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });

  const id = req.params.id;

  const sweet = await prisma.sweet.findUnique({ where: { id } as any });

  if (!sweet) return res.status(404).json({ error: "Not found" });

  // Only the creator can modify
  if (sweet.userId !== (req as any).user.id)
    return res
      .status(403)
      .json({ error: "Only sweet owner allowed to update" });

  const updated = await prisma.sweet.update({
    where: { id } as any,
    data: parsed.data,
  });

  return res.status(200).json({ sweet: updated });
});

// Delete a sweet - only admin and only the creator
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;

  const sweet = await prisma.sweet.findUnique({ where: { id } as any });

  if (!sweet) return res.status(404).json({ error: "Not found" });

  if (sweet.userId !== (req as any).user.id)
    return res
      .status(403)
      .json({ error: "Only sweet owner allowed to delete" });

  await prisma.sweet.delete({ where: { id } as any });

  return res.status(200).json({ deleted: true });
});

// GET / - list all sweets (auth required)
router.get("/", requireAuth, async (_req, res) => {
  const sweets = await prisma.sweet.findMany({
    include: {
      category: true,
      user: true,
    },
  });

  return res.status(200).json({ sweets });
});

// GET /search - search sweets by name, category, or price range (auth required)
const emptyToUndefined = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v));

export const SearchQuery = z
  .object({
    name: emptyToUndefined.optional(),

    categoryId: emptyToUndefined.optional(),

    priceMin: z.coerce.number().nonnegative().optional(),

    priceMax: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    (q) =>
      q.priceMin === undefined ||
      q.priceMax === undefined ||
      q.priceMin <= q.priceMax,
    {
      message: "Minimum price must be <= Maximum price",
      path: ["priceMin"],
    },
  );

router.get("/search", requireAuth, async (req, res) => {
  const parsed = SearchQuery.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      errors: formatZodErrors(parsed.error),
    });
  }

  console.log("Parsed search query:", parsed.data);

  const { name, categoryId, priceMin, priceMax } = parsed.data;

  const where: any = {};

  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {};

    if (priceMin !== undefined) {
      where.price.gte = priceMin;
    }

    if (priceMax !== undefined) {
      where.price.lte = priceMax;
    }
  }

  const sweets = await prisma.sweet.findMany({
    where,
    include: {
      category: true,
    },
  });

  return res.status(200).json({ sweets });
});

export default router;
