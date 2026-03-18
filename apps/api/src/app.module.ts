import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './infrastructure/cache/redis.module';
import { DatabaseMongooseModule } from './infrastructure/database/mongoose.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';
import { CloudinaryModule } from './modules/media/infrastructure/cloudinary/cloudinary.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseMongooseModule,
    RedisModule,
    CloudinaryModule,
    HealthModule,
    AuthModule,
    AuthorizationModule,
    MediaModule,
    NotificationsModule,
  ],
})
export class AppModule {}
