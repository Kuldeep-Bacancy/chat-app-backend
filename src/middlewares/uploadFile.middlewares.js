import ApiResponse from "../utils/ApiResponse.js";
import { upload } from "./multer.middlewares.js";
import fs from "fs"

export const uploadFileMiddleware = (req, res, next) => {
  // Use multer upload instance
  upload.array('attachments[]', 2)(req, res, (err) => {
    if (err && err.code == 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(
        new ApiResponse(400, 'You can only upload maximum 2 attachments!')
      )
    }

    // Retrieve uploaded files
    const files = req.files;
    const errors = [];

    // Validate file types and sizes
    files.forEach((file) => {
      const allowedTypes = ['image/jpeg', 'image/png'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.mimetype)) {
        files.forEach((file) => {
          fs.unlinkSync(file.path);
        });

        return res.status(400).json(
          new ApiResponse(400, 'Only allowed jpeg and png files allowed!')
        )
      }

      if (file.size > maxSize) {
        files.forEach((file) => {
          fs.unlinkSync(file.path);
        });

        return res.status(400).json(
          new ApiResponse(400, `File too large: ${file.originalname} (max allowed 2 MB)`)
        )
      }
    });

    // Attach files to the request object
    req.files = files;

    // Proceed to the next middleware or route handler
    next();
  });
};