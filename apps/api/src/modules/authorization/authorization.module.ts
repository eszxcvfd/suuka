import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reflector } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationService } from './application/authorization.service';
import { AuthorizationGuard } from './adapters/authorization.guard';
import { InternalAuthorizationController } from './adapters/internal-authorization.controller';
import { AuthorizationAuditRepository } from './infrastructure/authorization-audit.repository';
import {
  AuthorizationAuditEventModel,
  AuthorizationAuditEventSchema,
} from './infrastructure/authorization-audit.schema';

@Module({
  controllers: [InternalAuthorizationController],
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: AuthorizationAuditEventModel.name, schema: AuthorizationAuditEventSchema },
    ]),
  ],
  providers: [AuthorizationService, AuthorizationGuard, AuthorizationAuditRepository, Reflector],
  exports: [AuthorizationService, AuthorizationGuard, AuthorizationAuditRepository],
})
export class AuthorizationModule {}
