import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConfigService {
  get(name: string): string {
    return process.env[name];
  }
}
