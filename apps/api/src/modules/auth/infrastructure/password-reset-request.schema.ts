import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PasswordResetRequestDocument = HydratedDocument<PasswordResetRequestModel>;

@Schema({ collection: 'password_reset_requests', timestamps: true })
export class PasswordResetRequestModel {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  challengeHash!: string;

  @Prop({ required: true, enum: ['pending', 'consumed', 'expired', 'invalidated'] })
  status!: 'pending' | 'consumed' | 'expired' | 'invalidated';

  @Prop({ required: true })
  issuedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: false })
  consumedAt?: Date;
}

export const PasswordResetRequestSchema = SchemaFactory.createForClass(PasswordResetRequestModel);

PasswordResetRequestSchema.index({ userId: 1, status: 1 });
PasswordResetRequestSchema.index({ expiresAt: 1 });
