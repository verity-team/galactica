import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { DevService } from "./dev.service";
import { GetSiweMessageDTO, GetSiweMessageResponse } from "./dev.type";
import { NonEmptyBodyGuard, NonProductionGuard } from "./dev.guard";

@Controller("dev")
@UseGuards(NonProductionGuard, NonEmptyBodyGuard)
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Post("siwe/message")
  requestSiweMessage(@Body() input: GetSiweMessageDTO): GetSiweMessageResponse {
    const message = this.devService.getSiweMessage(input);
    return {
      message,
    };
  }
}
