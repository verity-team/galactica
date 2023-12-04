import { Request, Response } from "express";
import { Logger } from "@nestjs/common";
import { NextFunction } from "express";

export function requestTimer(req: Request, res: Response, next: NextFunction) {
  const logger = new Logger();
  const start = performance.now();
  next();

  res.on("close", () => {
    const elapsedTime = performance.now() - start;
    if (res.statusCode < 400) {
      // Consider to be a successful request
      logger.log(`${req.method} ${req.url}: OK - ${elapsedTime.toFixed(2)} ms`);
    } else {
      logger.log(`${req.method} ${req.url}: FAILED. ${elapsedTime} ms`);
    }
  });
}
