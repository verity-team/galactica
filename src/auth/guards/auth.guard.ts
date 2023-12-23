import { verifyJwtAsync } from "@/utils/token";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Request } from "express";

export function extractBearerToken(
  request: Record<string, any>,
): Maybe<string> {
  const authorizationHeader = request.get("Authorization");
  if (!authorizationHeader) {
    return null;
  }

  const accessToken = authorizationHeader.slice("Bearer ".length);
  if (!accessToken) {
    return null;
  }
  return accessToken;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract authorization header
    const accessToken = extractBearerToken(request);
    if (!accessToken) {
      this.logger.error(
        "Failed to extract access token from Authorization header",
      );
      return false;
    }

    // Verify access token
    try {
      await verifyJwtAsync<{ address: string }>(accessToken);
    } catch (error) {
      this.logger.error("Invalid JWT");
      return false;
    }

    return true;
  }
}
