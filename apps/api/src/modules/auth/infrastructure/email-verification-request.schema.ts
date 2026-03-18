import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EmailVerificationRequestDocument = HydratedDocument<EmailVerificationRequestModel>;

@Schema({ collection: 'email_verification_requests', timestamps: true })
export class EmailVerificationRequestModel {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  challengeHash!: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'expired', 'invalidated'] })
  status!: 'pending' | 'completed' | 'expired' | 'invalidated';

  @Prop({ required: true })
  issuedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: false })
  completedAt?: Date;
}

export const EmailVerificationRequestSchema = SchemaFactory.createForClass(EmailVerificationRequestModel);

EmailVerificationRequestSchema.index({ userId: 1, status: 1 });
EmailVerificationRequestSchema.index({ expiresAt: 1 });
