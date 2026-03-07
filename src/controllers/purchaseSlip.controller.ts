import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * CREATE PURCHASE SLIP
 */
export const createPurchaseSlip = async (req: Request, res: Response) => {
  try {
    const {
      slipNo,
      date,
      farmer,
      location,
      mobile,
      item,
      type,
      grade,
      rate,
      weights,
      createdById,
    } = req.body;

    if (!weights || weights.length === 0) {
      return res.status(400).json({ message: "Weights are required" });
    }

    const totalWeight = weights.reduce(
      (sum: number, w: any) => sum + Number(w.value || 0),
      0,
    );

    const totalAmount = totalWeight * Number(rate);

    const slip = await prisma.purchaseSlip.create({
      data: {
        slipNo,
        date: new Date(date),
        farmer,
        location,
        mobile,
        item,
        type,
        grade,
        rate: Number(rate),
        totalWeight,
        totalAmount,
        createdById,
        weights: {
          create: weights.map((w: any) => ({
            value: Number(w.value),
          })),
        },
      },
      include: {
        weights: true,
      },
    });

    res.status(201).json(slip);
  } catch (error: any) {
    console.log("error: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ALL SLIPS
 */
export const getPurchaseSlips = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      createdById,
      status,
      item,
      farmer,
      fromDate,
      toDate,
      sortBy,
      order,
    } = req.query;

    const where: any = {};

    if (createdById) {
      where.createdById = Number(createdById);
    }

    if (status) {
      where.status = status;
    }

    if (item) {
      where.item = {
        contains: String(item),
        mode: "insensitive",
      };
    }

    if (farmer) {
      where.farmer = {
        contains: String(farmer),
        mode: "insensitive",
      };
    }

    if (fromDate || toDate) {
      where.date = {};

      if (fromDate) {
        where.date.gte = new Date(String(fromDate));
      }

      if (toDate) {
        where.date.lte = new Date(String(toDate));
      }
    }

    const orderBy: any = {};

    if (sortBy) {
      orderBy[String(sortBy)] = order === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [rows, total] = await Promise.all([
      prisma.purchaseSlip.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          weights: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
      }),

      prisma.purchaseSlip.count({ where }),
    ]);

    const data = rows.map((slip) => {
      const shortageWeight = slip.totalWeight * 0.97;
      const shortageAmount = shortageWeight * slip.rate;

      return {
        ...slip,
        shortageWeight,
        shortageAmount,
      };
    });

    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Purchase Slip Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch purchase slips" });
  }
};

/**
 * UPDATE PURCHASE SLIP
 */
export const updatePurchaseSlip = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const {
      farmer,
      location,
      mobile,
      item,
      type,
      grade,
      rate,
      weights,
      status,
    } = req.body;

    let totalWeight;
    let totalAmount;

    if (weights) {
      totalWeight = weights.reduce(
        (sum: number, w: any) => sum + Number(w.value || 0),
        0,
      );

      totalAmount = totalWeight * Number(rate);

      await prisma.weight.deleteMany({
        where: { slipId: id },
      });
    }

    const slip = await prisma.purchaseSlip.update({
      where: { id },
      data: {
        farmer: farmer ?? undefined,
        location: location ?? undefined,
        mobile: mobile ?? undefined,
        item: item ?? undefined,
        type: type ?? undefined,
        grade: grade ?? undefined,
        rate: rate ? Number(rate) : undefined,
        status: status ?? undefined,
        totalWeight,
        totalAmount,

        ...(weights && {
          weights: {
            create: weights.map((w: any) => ({
              value: Number(w.value),
            })),
          },
        }),
      },

      include: {
        weights: true,
      },
    });

    res.json(slip);
  } catch (error: any) {
    console.error("Update slip error:", error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * DELETE PURCHASE SLIP
 */
export const deletePurchaseSlip = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.weight.deleteMany({
      where: { slipId: id },
    });

    await prisma.purchaseSlip.delete({
      where: { id },
    });

    res.json({ message: "Purchase slip deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
