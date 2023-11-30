import { verifyJwtAsync } from "@/utils/token";
import { Maybe } from "@/utils/types/util.type";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

export function extractBearerToken(request: Request): Maybe<string> {
  const authorizationHeader = request.headers.authorization;
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

    // Verify access token
    try {
      await verifyJwtAsync<{ address: string }>(accessToken);
    } catch (error) {
      return false;
    }

    return true;
  }
}
