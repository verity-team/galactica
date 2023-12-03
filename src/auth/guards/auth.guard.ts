import { verifyJwtAsync } from "@/utils/token";
import { Maybe } from "@/utils/types/util.type";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract authorization header
    const accessToken = extractBearerToken(request);
    if (!accessToken) {
      return false;
    }

    // Verify access token
    try {
      await verifyJwtAsync<{ address: string }>(accessToken);
    } catch (error) {
      return false;
    }

    return true;
  }
}
