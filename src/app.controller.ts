import { Controller, Get, Scope } from "@nestjs/common";
import { AppService } from "./app.service";
import { EmptyResponse } from "./utils/types/EmptyResponse";

@Controller({ scope: Scope.REQUEST })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("live")
  getLiveStatus(): EmptyResponse {
    // TODO: Check APIs' dependencies on database
    // TODO: Check APIs' dependencies on 3rd-party APIs (if any)
    return {};
  }

  @Get("ready")
  getReadyStatus(): EmptyResponse {
    return {};
  }
}
