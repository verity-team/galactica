import { Controller, Get, UseGuards } from "@nestjs/common";
import { DevService } from "./dev.service";
import { GetSiweMessageDTO, GetSiweMessageResponse } from "./dev.type";
import { NonProductionGuard } from "./dev.guard";

@Controller("dev")
@UseGuards(NonProductionGuard)
export class DevController {
  constructor(private readonly devService: DevService) {}

  @Get("siwe/message")
  getSiweMessage(input: GetSiweMessageDTO): GetSiweMessageResponse {
    const message = this.devService.getSiweMessage(input);
    return {
      message,
    };
  }
}
