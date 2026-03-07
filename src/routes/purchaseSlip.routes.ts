import { Router } from "express";
import {
  createPurchaseSlip,
  getPurchaseSlips,
  updatePurchaseSlip,
  deletePurchaseSlip,
} from "../controllers/purchaseSlip.controller";

const router = Router();

router.get("/", getPurchaseSlips);
router.post("/", createPurchaseSlip);
router.put("/:id", updatePurchaseSlip);
router.delete("/:id", deletePurchaseSlip);

export default router;
