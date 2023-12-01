import { CanActivate, ExecutionContext } from "@nestjs/common";

/**
 * Only allow in non-production
 */
export class NonProductionGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    const environment = process.env.NODE_ENV;
    if (environment == null) {
      return true;
    }

    if (environment.toLowerCase() == "production") {
      return false;
    }

    return true;
  }
}
