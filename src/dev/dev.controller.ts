import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { DevService } from "./dev.service";
import { GetSiweMessageDTO, GetSiweMessageResponse } from "./dev.type";
import { NonEmptyBodyGuard, NonProductionGuard } from "./dev.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { SignInWithCredentialsDTO } from "@/auth/types/SignInWithCredentials";
import { EmptyResponse } from "@/utils/types/EmptyResponse";

@Controller("dev")
@SkipThrottle()
@UseGuards(NonProductionGuard)
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post("siwe-message")
  @UseGuards(NonEmptyBodyGuard)
  requestSiweMessage(@Body() input: GetSiweMessageDTO): GetSiweMessageResponse {
    const message = this.devService.getSiweMessage(input);
    return {
      message,
    };
  }

  @Post("sign-up-admin")
  @UseGuards(NonEmptyBodyGuard)
  async requestAdminAccount(
    @Body() credientials: SignInWithCredentialsDTO,
  ): Promise<EmptyResponse> {
    await this.devService.signUpAdmin(credientials);
    return {};
  }
}
