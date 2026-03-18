import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ collection: 'users', timestamps: true })
export class UserModel {
  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email!: string;

  @Prop({ required: true, trim: true })
  displayName!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, default: 'active', enum: ['active', 'suspended', 'deleted'] })
  status!: 'active' | 'suspended' | 'deleted';

  @Prop({ required: true, default: false })
  emailVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.index({ email: 1 }, { unique: true });
