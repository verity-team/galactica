import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { extractBearerToken } from "./auth.guard";
import { decode } from "jsonwebtoken";

/**
 * This Guard does not verify access token and is supceptible to attacks
 *
 * Consider using this Guard with AuthGuard to mitigate above risk
 */
@Injectable()
export class AddressThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const accessToken = extractBearerToken(req);

    // Resort to IP Address when there are no access token
    if (!accessToken) {
      return this.getIpAddress(req);
    }

    const jwtPayload = decode(accessToken, { complete: false, json: true });
    const payload = jwtPayload["address"];

    // Resort to IP Address when there are no address in access token
    if (!payload) {
      return this.getIpAddress(req);
    }

    return payload;
  }

  getIpAddress(req: Record<string, any>): string {
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
