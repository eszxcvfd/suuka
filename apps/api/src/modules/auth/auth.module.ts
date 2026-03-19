import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { loadAuthConfig } from '../../config/auth.config';
import { loadMailConfig } from '../../config/mail.config';
import { AuthService } from './application/auth.service';
import { PasswordService } from './application/password.service';
import { TokenService } from './application/token.service';
import { AuthController } from './adapters/auth.controller';
import { JwtAuthGuard } from './adapters/jwt-auth.guard';
import { AuthorizationModule } from '../authorization/authorization.module';
import {
  EmailVerificationRequestModel,
  EmailVerificationRequestSchema,
} from './infrastructure/email-verification-request.schema';
import { EmailVerificationRequestRepository } from './infrastructure/email-verification-request.repository';
import {
  RefreshCredentialModel,
  RefreshCredentialSchema,
} from './infrastructure/refresh-credential.schema';
import {
  PasswordResetRequestModel,
  PasswordResetRequestSchema,
} from './infrastructure/password-reset-request.schema';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionModel, SessionSchema } from './infrastructure/session.schema';
import { UserRepository } from './infrastructure/user.repository';
import { UserModel, UserSchema } from './infrastructure/user.schema';
import { VerificationEmailService } from './infrastructure/verification-email.service';

@Module({
  imports: [
    forwardRef(() => AuthorizationModule),
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
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    {
      provide: 'AUTH_MAIL_CONFIG_VALIDATION',
      useFactory: () => {
        if (loadAuthConfig().requireVerifiedEmail) {
          loadMailConfig();
        }

        return true;
      },
    },
    EmailVerificationRequestRepository,
    VerificationEmailService,
    UserRepository,
    SessionRepository,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    PasswordService,
    VerificationEmailService,
    UserRepository,
    SessionRepository,
    JwtAuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
