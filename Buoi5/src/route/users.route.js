import { Router } from "express";
import * as userController from "../controller/users.controller.js";
import { validate, createUserRules } from "../middleware/validate.js";

const router = Router();


router.get("/", userController.getAllUsers);
router.get("/:id/", userController.getUserById);
router.post("/", validate(createUserRules), userController.createUser);

export default router;