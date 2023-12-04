import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger();
  logger.log(`${req.method} ${req.url}: REQUEST`);
  next();
}
