import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";

/**
 * Only allow in non-production
 */
export class NonProductionGuard implements CanActivate {
  private readonly logger = new Logger(NonProductionGuard.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    const environment = process.env.NODE_ENV;
    if (environment == null) {
      // Assume it's development when NODE_ENV is not set
      return true;
    }

    if (environment.toLowerCase() == "production") {
      this.logger.error("Cannot access dev endpoints on production");
      return false;
    }

    return true;
  }
}

export class NonEmptyBodyGuard implements CanActivate {
  private readonly logger = new Logger(NonEmptyBodyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (
      request.body == null ||
      (request.body.constructor === Object &&
        Object.keys(request.body).length === 0)
    ) {
      this.logger.error("Does not accept empty body request");
      throw new ForbiddenException("Does not accept empty body request");
    }

    return true;
  }
}
