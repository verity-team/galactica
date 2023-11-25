import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetNonceResponse } from "./types/GetNonce";
import { VerifySignatureDTO } from "./types/VerifySignature";
import { EmptyResponse } from "@/utils/types/EmptyResponse";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  getNonce(): GetNonceResponse {
    const nonce = this.authService.getNonce();
    return { nonce };
  }

  @Post("verify")
  @HttpCode(200)
  async verifySignature(
    @Body() body: VerifySignatureDTO,
  ): Promise<EmptyResponse> {
    const isValid = await this.authService.verifySignature(body);
    if (!isValid) {
      throw new ForbiddenException();
    }
    return {};
  }
}
