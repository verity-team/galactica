import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Scope,
} from "@nestjs/common";
import { EmptyResponse } from "./utils/types/EmptyResponse";
import { AppService } from "./app.service";

@Controller({ scope: Scope.REQUEST })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("live")
  getLiveStatus(): EmptyResponse {
    const isLive = this.appService.getLiveStatus();
    if (!isLive) {
      throw new HttpException(
        "Server unavailable",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {};
  }

  @Get("ready")
  getReadyStatus(): EmptyResponse {
    const isReady = this.appService.getReadyStatus();
    if (!isReady) {
      throw new HttpException(
        "Server is not ready",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {};
  }
}
