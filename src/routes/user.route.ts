import express from "express";
import {
  getAllUserHandler,
  getMeHandler,
} from "../controllers/user.controller";
import { administrator } from "../middleware/administrator";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";

const router = express.Router();

router.use(deserializeUser, requireUser);

router.get("/me", getMeHandler);
router.get("/", administrator("admin"), getAllUserHandler);

export default router;
