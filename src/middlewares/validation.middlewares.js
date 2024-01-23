import { validationResult } from "express-validator";
import ApiResponse from "../utils/ApiResponse.js"

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => {
    extractedErrors.push(err.msg);
  });

  return res.status(422).json(
    new ApiResponse(422, "Validation Error", [], extractedErrors)
  );
};