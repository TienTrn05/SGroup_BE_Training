import { BadRequestError } from "../core/error.response.js";
import { validationResult, body, param } from "express-validator";

export const validate = (rules) => {
  return async (req, res, next) => {
    // Chạy tuần tự từng rule
    for (const rule of rules) {
      await rule.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Gộp tất cả lỗi thành mảng { field, message }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    // Ném BadRequestError kèm danh sách lỗi chi tiết
    const error = new BadRequestError("Validation failed");
    error.errors = formattedErrors;
    return next(error);
  };
};

export const createUserRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be an integer between 1 and 120")
    .toInt(),
];

export const userIdRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
];

export const updateUserRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Email is not valid")
    .normalizeEmail(),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be an integer between 1 and 120")
    .toInt(),
  body().custom((value) => {
    const allowedFields = ["name", "email", "age"];
    const hasFieldToUpdate = allowedFields.some((field) =>
      Object.prototype.hasOwnProperty.call(value, field),
    );

    if (!hasFieldToUpdate) {
      throw new Error("At least one of name, email or age is required");
    }

    return true;
  }),
];

export const deleteUserRules = userIdRules;
