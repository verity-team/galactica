import { CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { extractBearerToken } from "./auth.guard";
import { decode } from "jsonwebtoken";

export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // TOOD: Verify and decode JWT to find out user type
    const authToken = extractBearerToken(request);
    if (!authToken) {
      this.logger.error("Request does not come with access token");
      return false;
    }

    const requestedRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );

    if (requestedRoles.length === 0) {
      return true;
    }

    const payload = decode(authToken, { json: true });
    if (!payload.role) {
      this.logger.error("Access token is valid but does not include role");
      return false;
    }

    const isValidRole = requestedRoles.includes(payload.role);
    if (!isValidRole) {
      this.logger.error(
        `Role mismatch. Expected ${requestedRoles}. Actual ${payload.role}`,
      );
    }
    return isValidRole;
  }
}
