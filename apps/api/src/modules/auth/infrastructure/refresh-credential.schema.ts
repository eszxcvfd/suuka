import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshCredentialDocument = HydratedDocument<RefreshCredentialModel>;

@Schema({ collection: 'refresh_credentials', timestamps: true })
export class RefreshCredentialModel {
  @Prop({ required: true })
  sessionId!: string;

  @Prop({ required: true })
  credentialHash!: string;

  @Prop({ required: true })
  lineageId!: string;

  @Prop({ required: true, enum: ['active', 'replaced', 'revoked', 'expired'] })
  state!: 'active' | 'replaced' | 'revoked' | 'expired';

  @Prop({ required: true })
  issuedAt!: Date;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: false })
  replacedById?: string;
}

export const RefreshCredentialSchema = SchemaFactory.createForClass(RefreshCredentialModel);

RefreshCredentialSchema.index({ sessionId: 1, state: 1 });
RefreshCredentialSchema.index({ lineageId: 1, state: 1 });
RefreshCredentialSchema.index({ expiresAt: 1 });
