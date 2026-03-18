import { Module } from '@nestjs/common';
import { MediaService } from './application/media.service';
import { MediaController } from './adapters/media.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
