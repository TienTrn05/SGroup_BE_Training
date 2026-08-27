import { Router } from "express";
import * as userController from "../controller/users.controller.js";
import {
  validate,
  createUserRules,
  userIdRules,
  updateUserRules,
  deleteUserRules,
} from "../middleware/validate.js";

const router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", validate(userIdRules), userController.getUserById);
router.post("/", validate(createUserRules), userController.createUser);
router.patch("/:id", validate(updateUserRules), userController.updateUser);
router.delete("/:id", validate(deleteUserRules), userController.deleteUser);

export default router;
