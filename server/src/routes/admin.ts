import express from "express";
import { asyncHandler, validateNumericParam } from "../middlewares/validation";
import { requireAdmin } from "../middlewares/auth";
import { getTokenForUser } from "../controllers/admin";

const router = express.Router();

router.use(requireAdmin);

// GET /admin/debug/get-token/:id -> returns a signed JWT for the given user id (admin only)
router.get("/get-token/:id", validateNumericParam("id"), asyncHandler(getTokenForUser));

export default router;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxNDg4NDYyLCJleHAiOjE3NjE1NzQ4NjJ9.ulkUOz0BPKs1BUKHgB8fYi1t68SBK9XEdRba80-KsV8