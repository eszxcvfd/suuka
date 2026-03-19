import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ collection: 'users', timestamps: true })
export class UserModel {
  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email!: string;

  @Prop({ required: true, trim: true })
  displayName!: string;

  @Prop({ required: false, trim: true })
  username?: string;

  @Prop({ required: false, lowercase: true, trim: true, unique: true, sparse: true })
  usernameCanonical?: string;

  @Prop({ required: false, default: '' })
  bio!: string;

  @Prop({ type: String, required: false, default: null })
  avatarMediaId?: string | null;

  @Prop({ type: [{ id: String, label: String, url: String }], default: [] })
  externalLinks!: Array<{ id: string; label: string; url: string }>;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, default: 'active', enum: ['active', 'suspended', 'deleted'] })
  status!: 'active' | 'suspended' | 'deleted';

  @Prop({ required: true, default: 'user', enum: ['admin', 'moderator', 'user'] })
  role!: 'admin' | 'moderator' | 'user';

  @Prop({ required: true, default: 'public', enum: ['public', 'private'] })
  accountVisibility!: 'public' | 'private';

  @Prop({ required: true, default: false })
  emailVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ usernameCanonical: 1 }, { unique: true, sparse: true });
