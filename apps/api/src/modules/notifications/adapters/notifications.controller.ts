import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from '../application/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Query('userId') userId = 'demo-user') {
    return {
      items: this.notificationsService.listForUser(userId),
    };
  }
}
