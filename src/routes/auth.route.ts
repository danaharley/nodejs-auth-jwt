import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
} from "../controllers/auth.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { validate } from "../middleware/validate";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";

const router = express.Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.get("/refresh", refreshAccessTokenHandler);

router.use(deserializeUser, requireUser);
router.delete("/logout", logoutHandler);

export default router;
