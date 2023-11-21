import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getLiveStatus(): boolean {
    return true;
  }

  getReadyStatus(): boolean {
    // TODO: Check APIs' dependencies on database
    // TODO: Check APIs' dependencies on 3rd-party APIs (if any)
    return true;
  }
}
