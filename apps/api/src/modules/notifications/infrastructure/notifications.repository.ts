import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../domain/notification.entity';

@Injectable()
export class NotificationsRepository {
  private readonly data: NotificationEntity[] = [
    {
      id: 'n1',
      userId: 'demo-user',
      title: 'Welcome',
      message: 'Your account is ready.',
      createdAt: new Date().toISOString(),
    },
  ];

  findByUserId(userId: string): NotificationEntity[] {
    return this.data.filter((item) => item.userId === userId);
  }
}
