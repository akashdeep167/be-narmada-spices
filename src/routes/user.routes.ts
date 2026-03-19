import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { authMiddleware, authorize } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all routes except those that don't need it
router.use(authMiddleware);

/**
 * ADMIN - User management
 */
router.get("/", authorize("ADMIN"), getUsers);
router.get("/:id", authorize("ADMIN"), getUserById);
router.post("/", authorize("ADMIN"), createUser);
router.put("/:id", authorize("ADMIN"), updateUser);
router.delete("/:id", authorize("ADMIN"), deleteUser);

export default router;
