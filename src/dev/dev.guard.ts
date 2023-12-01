import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

/**
 * Only allow in non-production
 */
export class NonProductionGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    const environment = process.env.NODE_ENV;
    if (environment == null) {
      // Assume it's development when NODE_ENV is not set
      return true;
    }

    if (environment.toLowerCase() == "production") {
      return false;
    }

    return true;
  }
}

export class NonEmptyBodyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (
      request.body == null ||
      (request.body.constructor === Object &&
        Object.keys(request.body).length === 0)
    ) {
      throw new ForbiddenException("Does not accept empty body request");
    }

    return true;
  }
}
