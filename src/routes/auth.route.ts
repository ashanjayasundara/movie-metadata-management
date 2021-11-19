import { Router } from "express";
import AuthController from "../controller/AuthController";
import { checkToken } from "../middleware/token-validate.middleware";

const router = Router();
router.post("/login", AuthController.login);

router.post("/change-password", [checkToken], AuthController.changeUserPassword);

export default router;