import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { DevService } from "./dev.service";
import { GetSiweMessageDTO, GetSiweMessageResponse } from "./dev.type";
import { NonEmptyBodyGuard, NonProductionGuard } from "./dev.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { AddressThrottleGuard } from "@/auth/guards/address.guard";

@Controller("dev")
@SkipThrottle()
@UseGuards(NonProductionGuard)
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post("siwe/message")
  @UseGuards(NonEmptyBodyGuard)
  requestSiweMessage(@Body() input: GetSiweMessageDTO): GetSiweMessageResponse {
    const message = this.devService.getSiweMessage(input);
    return {
      message,
    };
  }

  @Get("rate-limit-test")
  @UseGuards(AddressThrottleGuard)
  testRateLimit() {
    return { message: "Hello, World" };
  }
}
