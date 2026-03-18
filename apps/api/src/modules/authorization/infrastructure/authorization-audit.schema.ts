import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthorizationAuditDocument = HydratedDocument<AuthorizationAuditEventModel>;

@Schema({ collection: 'authorization_audit_events', timestamps: true })
export class AuthorizationAuditEventModel {
  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  actorPrincipalId!: string;

  @Prop()
  actorRole?: 'admin' | 'moderator' | 'user';

  @Prop({ required: true, enum: ['allowed', 'denied', 'override_allowed'] })
  decision!: 'allowed' | 'denied' | 'override_allowed';

  @Prop({ required: true })
  reasonCode!: string;

  @Prop({ type: [String], default: [] })
  scopesEvaluated!: string[];

  @Prop()
  requestPath?: string;

  @Prop()
  resourceId?: string;

  @Prop({ enum: ['account', 'comment', 'internal', 'media', 'post'] })
  resourceType?: 'account' | 'comment' | 'internal' | 'media' | 'post';

  @Prop()
  targetPrincipalId?: string;
}

export const AuthorizationAuditEventSchema = SchemaFactory.createForClass(
  AuthorizationAuditEventModel,
);
