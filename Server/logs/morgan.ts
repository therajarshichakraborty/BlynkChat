import { type Request, type Response } from "express";
import morgan from "morgan";
import logger from "./winston";
import { env } from "@/config/env";

const format =
  env.NODE_ENV === "production"
    ? ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
    : ":method :url :status :res[content-length] - :response-time ms";

const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

const skip = (_req: Request, res: Response): boolean => {
  if (env.NODE_ENV === "production") {
    return res.statusCode < 400;
  }
  return false;
};

export const morganMiddleware = morgan(format, { stream, skip });

export default morganMiddleware;
