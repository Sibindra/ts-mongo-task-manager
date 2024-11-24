import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  MONGODB_URL: str({ devDefault: testOnly("mongodb://127.0.0.1:27017/test") }),
  TEMP_MEDIA_PATH: str({ devDefault: testOnly("public/temp/") }),
  JWT_SECRET: str({ devDefault: testOnly("secret") }),
  JWT_ACCESS_EXPIRATION: str({ devDefault: testOnly("1h") }),
  JWT_REFRESH_SECRET: str({ devDefault: testOnly("refreshSecret") }),
  JWT_REFRESH_EXPIRATION: str({ devDefault: testOnly("7d") }),
  ADMIN_EMAIL: str({ devDefault: testOnly("test@gmail.com") }),
  ADMIN_PASSWORD: str({ devDefault: testOnly("admin1234") }),
  ADMIN_NAME: str({ devDefault: testOnly("Admin") }),
  CSV_RECORDS_PATH: str({ devDefault: testOnly("public/records/") }),
  PRODUCT_STOCK_THRESHOLD: num({ devDefault: testOnly(10) }),
  EMAIL_HOST: str({ devDefault: testOnly("smtp.gmail.com") }),
  EMAIL_PORT: num({ devDefault: testOnly(587) }),
  EMAIL_USER: str({ devDefault: testOnly("test@test.com") }),
  EMAIL_PASS: str({ devDefault: testOnly("password") }),
  EMAIL_FROM: str({ devDefault: testOnly("nobody") }),
  EMAIL_TEMPLATES_PATH: str({ devDefault: testOnly("public/templates/email") }),
});
