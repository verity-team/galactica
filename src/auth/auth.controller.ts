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
import { AddressThrottleGuard } from "./guards/address.guard";
import { EmptyResponse } from "@/utils/types/EmptyResponse";
import { AuthGuard, extractBearerToken } from "./guards/auth.guard";
import { RoleGuard } from "./guards/role.guard";
import { Roles } from "./decorators/role.decorator";
import {
  GetNonceResponse,
  VerifySignatureDTO,
  AccessTokenResponse,
} from "./types";
import { SignInWithCredentialsDTO } from "./types/SignInWithCredentials";

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
  ): Promise<AccessTokenResponse> {
    const accessToken = await this.authService.verifySignature(body);
    return {
      accessToken,
    };
  }

  @Post("verify/user")
  @HttpCode(200)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(["user"])
  verifyUserAccessToken(
    @Req() request: Request,
    @Body() { address }: { address: string },
  ): EmptyResponse {
    const accessToken = extractBearerToken(request);
    const isValid = this.authService.verifyUserAccessToken(
      accessToken,
      address,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid access token");
    }

    return {};
  }

  @Post("verify/admin")
  @HttpCode(200)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(["admin"])
  async verifyAdminAccessToken(
    @Req() request: Request,
  ): Promise<EmptyResponse> {
    const accessToken = extractBearerToken(request);
    const isValid = await this.authService.verifyAdminAccessToken(accessToken);
    if (!isValid) {
      throw new UnauthorizedException("Invalid access token");
    }

    return {};
  }

  @Post("signin")
  @HttpCode(200)
  async signInWithCredentials(
    @Body() credentials: SignInWithCredentialsDTO,
  ): Promise<AccessTokenResponse> {
    const accessToken =
      await this.authService.signInWithCredentials(credentials);
    return { accessToken };
  }
}
