import { Controller } from "@nestjs/common";
import { MemeService } from "./meme.service";

@Controller("meme")
export class MemeController {
  constructor(private readonly memeService: MemeService) {}
}
