import { Request, Response } from "express";
import { NextFunction } from "express";
import { LoggerService } from "@/logger/logger.service";

export function requestTimer(req: Request, res: Response, next: NextFunction) {
  const logger = new LoggerService("REQUEST DONE METRIC");
  const start = performance.now();

  res.on("close", () => {
    const elapsedTime = performance.now() - start;
    if (res.statusCode < 400) {
      // Consider to be a successful request
      logger.log(`${req.method} ${req.url}: OK - ${elapsedTime.toFixed(2)} ms`);
    } else {
      logger.log(
        `${req.method} ${req.url}: FAILED ${
          res.statusCode
        }. ${elapsedTime.toFixed(2)} ms`,
      );
    }
  });

  next();
}
