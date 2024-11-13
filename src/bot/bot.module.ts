import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotService } from './bot.service';
import { Test } from './test.model';
import { ConfigService } from '../config/config.service'; // ConfigService import qilish
import { BotController } from './bot.controller';

@Module({
  imports: [SequelizeModule.forFeature([Test])],
  controllers: [BotController],
  providers: [BotService, ConfigService], // ConfigServiceni providerlarga qo'shish
})
export class BotModule {}
