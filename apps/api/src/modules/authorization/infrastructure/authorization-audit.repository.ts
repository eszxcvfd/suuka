import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { AuthorizationAuditRecord } from '@suuka/shared-types';
import { AuthorizationAuditEventModel } from './authorization-audit.schema';

@Injectable()
export class AuthorizationAuditRepository {
  constructor(
    @InjectModel(AuthorizationAuditEventModel.name)
    private readonly auditModel: Model<AuthorizationAuditEventModel>,
  ) {}

  async record(event: AuthorizationAuditRecord): Promise<void> {
    await this.auditModel.create(event);
  }

  async recordRoleAction(event: AuthorizationAuditRecord): Promise<void> {
    await this.record(event);
  }
}
