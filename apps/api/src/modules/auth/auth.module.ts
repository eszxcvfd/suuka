import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './application/auth.service';
import { PasswordService } from './application/password.service';
import { TokenService } from './application/token.service';
import { AuthController } from './adapters/auth.controller';
import { JwtAuthGuard } from './adapters/jwt-auth.guard';
import {
  EmailVerificationRequestModel,
  EmailVerificationRequestSchema,
} from './infrastructure/email-verification-request.schema';
import { RefreshCredentialModel, RefreshCredentialSchema } from './infrastructure/refresh-credential.schema';
import { PasswordResetRequestModel, PasswordResetRequestSchema } from './infrastructure/password-reset-request.schema';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionModel, SessionSchema } from './infrastructure/session.schema';
import { UserRepository } from './infrastructure/user.repository';
import { UserModel, UserSchema } from './infrastructure/user.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as any,
      },
    }),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: SessionModel.name, schema: SessionSchema },
      { name: RefreshCredentialModel.name, schema: RefreshCredentialSchema },
      { name: EmailVerificationRequestModel.name, schema: EmailVerificationRequestSchema },
      { name: PasswordResetRequestModel.name, schema: PasswordResetRequestSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, PasswordService, UserRepository, SessionRepository, JwtAuthGuard],
  exports: [AuthService, TokenService, PasswordService, UserRepository, SessionRepository, JwtAuthGuard],
})
export class AuthModule {}
