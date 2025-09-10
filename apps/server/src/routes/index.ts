import { Router } from "express";
import signInController from "../controllers/user-controllers/signInController";

const router = Router();

router.post('/sign-in', signInController);

export default router;