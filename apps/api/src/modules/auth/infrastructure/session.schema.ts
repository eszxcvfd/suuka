import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<SessionModel>;

@Schema({ collection: 'auth_sessions', timestamps: true })
export class SessionModel {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  deviceLabel!: string;

  @Prop({ required: true, enum: ['web', 'mobile'] })
  clientType!: 'web' | 'mobile';

  @Prop({ required: false })
  ipAddress?: string;

  @Prop({ required: true })
  lastActivityAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: false })
  revokedAt?: Date;

  @Prop({ required: false })
  revokeReason?: string;
}

export const SessionSchema = SchemaFactory.createForClass(SessionModel);

SessionSchema.index({ userId: 1, revokedAt: 1 });
SessionSchema.index({ expiresAt: 1 });
