import express, { type Express } from "express";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";
import { middlewareConfig } from "@/common/configs/middlewareConfig";
import { routerConfig } from "@/common/configs/routerConfig";
import { startCronJobs } from "@/common/cron/cronJobs";
import connectMongoDB from "@/common/database/connectMongoDB";
import { watchProductStock } from "@/common/database/watchProductSock";
import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";

const logger = pino({ name: "server start" });
const app: Express = express();

// Middleware configuration
middlewareConfig(app);

// Request logging
app.use(requestLogger);

// Router configuration
routerConfig(app);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

// Connect to Mongodb
connectMongoDB();
watchProductStock();

// Start Cronjobs
startCronJobs();

export { app, logger };
