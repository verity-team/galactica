import { Controller, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetNonceResponse } from "./auth.type";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("nonce")
  getNonce(): GetNonceResponse {
    const nonce = this.authService.getNonce();
    return { nonce };
  }
}
