import { LoggerService } from "@/logger/logger.service";
import { Request, Response } from "express";
import { NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const logger = new LoggerService("INCOMING REQUEST");
  logger.log(`${req.method} ${req.url}: REQUEST`);
  next();
}
