import { Controller, Get } from "@nestjs/common";
import { BotService } from "./bot.service";

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get('/start')
  async startBot() {
    this.botService.startBot(); // Botni ishga tushurish
    return { message: 'Bot ishga tushdi' };
  }

  // ... boshqa metodlar
}
