import { env } from "@/common/configs/envConfig";
import multer, { diskStorage, MulterError } from "multer";

const whitelist = ["text/csv"];

const upload = multer({
  storage: diskStorage({
    destination: env.TEMP_MEDIA_PATH,
    filename: (_, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),

  fileFilter: (_, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
      const error = new MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type");
      return cb(error);
    }
    cb(null, true);
  },
});

export default upload;
