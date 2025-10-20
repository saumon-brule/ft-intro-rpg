import express from "express";
import { requireAdmin } from "../middlewares/auth";
import { validatePermission, validateNumericParam, asyncHandler, validateBody } from "../middlewares/validation";
import { getMe, getAllUsers, updateUserPermission } from "../controllers/users";

export function createUserRouter() {
  const router = express.Router();

  // Get current user info
  router.get("/me", asyncHandler(getMe));

  // Get all users (admin only)
  router.get("/", requireAdmin, asyncHandler(getAllUsers));

  // Update user permission (admin only)
  router.patch(
    "/:id42/permission",
    requireAdmin,
    validateNumericParam("id42"),
    validateBody(["permission"]),
    validatePermission,
    asyncHandler(updateUserPermission)
  );

  return router;
}
