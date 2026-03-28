import { Router } from "express";
import {
  createPurchaseSlip,
  getPurchaseSlips,
  updatePurchaseSlip,
  deletePurchaseSlip,
} from "../controllers/purchaseSlip.controller";
import { authMiddleware, authorize } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * PURCHASER - Form fill (create purchase slip)
 */
router.post("/", authorize("PURCHASER", "ADMIN"), createPurchaseSlip);

/**
 * PURCHASER - View own purchase slips
 * SUPERVISOR - Table view all purchase slips
 * FINANCER - View all purchase slips for payment
 * ADMIN - View all purchase slips
 */
router.get(
  "/",
  authorize("PURCHASER", "SUPERVISOR", "FINANCER", "ADMIN"),
  getPurchaseSlips,
);
router.put(
  "/:id",
  authorize("SUPERVISOR", "ADMIN", "FINANCER"),
  updatePurchaseSlip,
);

/**
 * ADMIN/INVENTORY_MANAGER - Delete purchase slips and payment done
 */
router.delete("/:id", authorize("ADMIN"), deletePurchaseSlip);

export default router;
