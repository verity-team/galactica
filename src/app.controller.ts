import { Controller, Get, Scope } from "@nestjs/common";
import { EmptyResponse } from "./utils/types/EmptyResponse";

@Controller({ scope: Scope.REQUEST })
export class AppController {
  constructor() {}

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
