import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailVerificationRequestModel } from './email-verification-request.schema';

@Injectable()
export class EmailVerificationRequestRepository {
  constructor(
    @InjectModel(EmailVerificationRequestModel.name)
    private readonly verificationRequestModel: Model<EmailVerificationRequestModel>,
  ) {}

  async createPendingRequest(input: {
    challengeHash: string;
    expiresAt: Date;
    userId: string;
  }): Promise<EmailVerificationRequestModel> {
    const issuedAt = new Date();

    return this.verificationRequestModel.create({
      challengeHash: input.challengeHash,
      expiresAt: input.expiresAt,
      issuedAt,
      status: 'pending',
      userId: input.userId,
    });
  }

  async expirePendingRequests(now: Date): Promise<void> {
    await this.verificationRequestModel
      .updateMany({ expiresAt: { $lte: now }, status: 'pending' }, { $set: { status: 'expired' } })
      .exec();
  }

  async findPendingRequestByChallengeHash(
    challengeHash: string,
    now: Date,
  ): Promise<EmailVerificationRequestModel | null> {
    return this.verificationRequestModel
      .findOne({ challengeHash, expiresAt: { $gt: now }, status: 'pending' })
      .exec();
  }

  async invalidatePendingRequests(userId: string): Promise<void> {
    await this.verificationRequestModel
      .updateMany({ status: 'pending', userId }, { $set: { status: 'invalidated' } })
      .exec();
  }

  async invalidateOtherPendingRequests(userId: string, currentRequestId: string): Promise<void> {
    await this.verificationRequestModel
      .updateMany(
        { _id: { $ne: currentRequestId }, status: 'pending', userId },
        { $set: { status: 'invalidated' } },
      )
      .exec();
  }

  async markCompleted(id: string): Promise<void> {
    await this.verificationRequestModel
      .updateOne({ _id: id }, { $set: { completedAt: new Date(), status: 'completed' } })
      .exec();
  }

  async deletePendingRequest(id: string): Promise<void> {
    await this.verificationRequestModel.deleteOne({ _id: id, status: 'pending' }).exec();
  }
}
