import { Injectable } from "@nestjs/common";
import { logger } from "./winston.config";

@Injectable()
export class LoggerService {
  private readonly defaultContext: string;

  constructor(defaultContext?: string) {
    this.defaultContext = defaultContext ?? "";
  }

  log(message: string, context?: string) {
    logger.info(message, { context: context ?? this.defaultContext });
  }

  error(message: string, trace: string, context?: string) {
    logger.error(message, { context: context ?? this.defaultContext, trace });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context: context ?? this.defaultContext });
  }

  debug(message: string, context?: string) {
    logger.debug(message, { context: context ?? this.defaultContext });
  }
}
