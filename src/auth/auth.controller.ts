import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetNonceResponse } from "./types/GetNonce";
import {
  VerifySignatureDTO,
  VerifySignatureResponse,
} from "./types/VerifySignature";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  async getNonce(): Promise<GetNonceResponse> {
    const nonce = await this.authService.getNonce();
    return { nonce };
  }

  @Post("verify")
  @HttpCode(200)
  async verifySignature(
    @Body() body: VerifySignatureDTO,
  ): Promise<VerifySignatureResponse> {
    const accessToken = await this.authService.verifySignature(body);
    return {
      accessToken,
    };
  }
}
