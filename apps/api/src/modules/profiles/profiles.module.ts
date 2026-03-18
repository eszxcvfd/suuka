import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { MediaModule } from '../media/media.module';
import { ProfileController } from './adapters/profile.controller';
import { ProfileService } from './application/profile.service';

@Module({
  imports: [AuthModule, AuthorizationModule, MediaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfilesModule {}
