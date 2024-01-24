import { body } from "express-validator";
import { User } from "../models/user.models.js";


export const loginValidationRules = () => {
  return [
    body('email').trim().isEmail().withMessage('Email is not valid!'),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({ min: 6 }).withMessage('Password length must be at least 6!'),
  ];
};

export const registerValidationRules = () => {
  return [
    body('email').trim().isEmail().withMessage('Email is not valid!'),
    body('email').custom(
      async (value) => {
        const user = await User.findOne({ email: value })
        if (user) {
          throw new Error('E-mail already in use');
        }
      }
    ),
    body('password').notEmpty().withMessage('Password is required'),
    body('password').isLength({ min: 6 }).withMessage('Password length must be at least 6!'),
    body('username').notEmpty().withMessage('username is required!')
  ];
}