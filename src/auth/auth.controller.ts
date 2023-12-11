import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetNonceResponse } from "./types/GetNonce";
import {
  VerifyAccessTokenDTO,
  VerifySignatureDTO,
  VerifySignatureResponse,
} from "./types/VerifySignature";
import { AddressThrottleGuard } from "./guards/address.guard";
import { EmptyResponse } from "@/utils/types/EmptyResponse";
import { AuthGuard, extractBearerToken } from "./guards/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  @UseGuards(AddressThrottleGuard)
  async getNonce(): Promise<GetNonceResponse> {
    const nonce = await this.authService.getNonce();
    return nonce;
  }

  @Post("verify/siwe")
  @HttpCode(200)
  async verifySignature(
    @Body() body: VerifySignatureDTO,
  ): Promise<VerifySignatureResponse> {
    const accessToken = await this.authService.verifySignature(body);
    return {
      accessToken,
    };
  }

  @Post("verify/jwt")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  verifyAccessToken(
    @Req() request: Request,
    @Body() { address }: VerifyAccessTokenDTO,
  ): EmptyResponse {
    const accessToken = extractBearerToken(request);
    const isValid = this.authService.verifyAccessToken(accessToken, address);
    if (!isValid) {
      throw new UnauthorizedException("Invalid access token");
    }

    return {};
  }
}
