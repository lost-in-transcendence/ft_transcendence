import { Injectable } from '@nestjs/common';
import { env } from 'process';

@Injectable()
export class AppService {
  async getHello() {

  return {value: "tes grands morts"};
  }
}
