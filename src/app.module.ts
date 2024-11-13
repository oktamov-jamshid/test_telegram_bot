import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModule } from './bot/bot.module';
import * as dotenv from 'dotenv';
import { Test } from './bot/test.model';

dotenv.config(); // Load environment variables

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1', // Use environment variable with fallback
      port: parseInt(process.env.DB_PORT) || 5432, // Ensure the port is parsed as number
      username: process.env.DB_USERNAME || 'postgres', // Use environment variable
      password: process.env.DB_PASSWORD || '123456', // Use environment variable
      database: process.env.DB_NAME || 'postgres', // Use environment variable
      models: [Test],
      autoLoadModels: true,
      synchronize: true, // For production, consider turning this off for migrations
    }),
    BotModule,
  ],
})
export class AppModule {}
