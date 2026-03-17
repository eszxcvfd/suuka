import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../infrastructure/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  listForUser(userId: string) {
    return this.notificationsRepository.findByUserId(userId);
  }
}
