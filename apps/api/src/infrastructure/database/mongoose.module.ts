import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/suuka')],
  exports: [MongooseModule],
})
export class DatabaseMongooseModule {}
