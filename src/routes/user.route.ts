import { Router } from "express";
import UserController from "../controller/UserController";
import { checkToken } from "../middleware/token-validate.middleware";
import { authorizeRequest } from "../middleware/authorize.middleware";

const router = Router();

router.get("/", [checkToken, authorizeRequest(["ADMIN"])], UserController.findAllUsers);

// Get one user
router.get(
    "/:id([0-9]+)",
    [checkToken],
    UserController.getUserById
);

router.post("/", [checkToken, authorizeRequest(["ADMIN"])], UserController.createUser);


router.put("/",
    [checkToken, authorizeRequest(["ADMIN"])],
    UserController.updateUser
);

router.delete("/",
    [checkToken, authorizeRequest(["ADMIN"])],
    UserController.deleteUser
);

export default router;