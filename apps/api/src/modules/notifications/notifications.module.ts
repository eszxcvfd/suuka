import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { NotificationsController } from './adapters/notifications.controller';
import { NotificationsRepository } from './infrastructure/notifications.repository';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
