import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetNonceResponse } from "./types/GetNonce";
import {
  VerifySignatureDTO,
  VerifySignatureResponse,
} from "./types/VerifySignature";
import { AddressThrottleGuard } from "./guards/address.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  @UseGuards(AddressThrottleGuard)
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
