import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { vo1dService } from './vo1d/vo1d.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, vo1dService],
})
export class AppModule {}
