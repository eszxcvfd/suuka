import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshCredentialModel } from './refresh-credential.schema';
import { SessionModel } from './session.schema';

interface CreateSessionInput {
  clientType: 'web' | 'mobile';
  deviceLabel: string;
  expiresAt: Date;
  ipAddress?: string;
  userId: string;
}

interface CreateRefreshCredentialInput {
  credentialHash: string;
  expiresAt: Date;
  lineageId: string;
  sessionId: string;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(SessionModel.name) private readonly sessionModel: Model<SessionModel>,
    @InjectModel(RefreshCredentialModel.name)
    private readonly refreshCredentialModel: Model<RefreshCredentialModel>,
  ) {}

  async createSession(input: CreateSessionInput): Promise<SessionModel> {
    return this.sessionModel.create({
      clientType: input.clientType,
      deviceLabel: input.deviceLabel,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
      lastActivityAt: new Date(),
      userId: input.userId,
    });
  }

  async listActiveSessions(userId: string): Promise<SessionModel[]> {
    return this.sessionModel.find({ userId, revokedAt: { $exists: false } }).sort({ lastActivityAt: -1 }).exec();
  }

  async revokeSession(sessionId: string, reason: string): Promise<void> {
    await this.sessionModel.updateOne({ _id: sessionId }, { revokedAt: new Date(), revokeReason: reason }).exec();
  }

  async createRefreshCredential(input: CreateRefreshCredentialInput): Promise<RefreshCredentialModel> {
    return this.refreshCredentialModel.create({
      credentialHash: input.credentialHash,
      expiresAt: input.expiresAt,
      issuedAt: new Date(),
      lineageId: input.lineageId,
      sessionId: input.sessionId,
      state: 'active',
    });
  }

  async revokeRefreshLineage(lineageId: string): Promise<void> {
    await this.refreshCredentialModel.updateMany({ lineageId, state: 'active' }, { state: 'revoked' }).exec();
  }
}
