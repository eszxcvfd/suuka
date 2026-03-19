import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ProfileExternalLink, ProfileView } from '@suuka/shared-types';
import { UserModel } from './user.schema';

interface CreateUserInput {
  avatarMediaId?: string | null;
  bio?: string;
  accountVisibility?: 'public' | 'private';
  displayName: string;
  email: string;
  externalLinks?: ProfileExternalLink[];
  passwordHash: string;
  role?: 'admin' | 'moderator' | 'user';
  username?: string;
  usernameCanonical?: string;
}

interface UpdateProfileInput {
  accountVisibility?: 'public' | 'private';
  avatarMediaId?: string | null;
  bio?: string;
  displayName?: string;
  externalLinks?: ProfileExternalLink[];
  username?: string;
  usernameCanonical?: string;
}

@Injectable()
export class UserRepository {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserModel>) {}

  private getUserId(user: UserModel): string {
    return String((user as unknown as { _id: unknown })._id);
  }

  private toProfileView(user: UserModel): ProfileView {
    return {
      accountVisibility: user.accountVisibility,
      avatarUrl: null,
      bio: user.bio?.trim() ?? '',
      displayName: user.displayName,
      externalLinks: user.externalLinks ?? [],
      accountId: this.getUserId(user),
      username: user.username,
    };
  }

  async create(input: CreateUserInput): Promise<UserModel> {
    return this.userModel.create({
      avatarMediaId: input.avatarMediaId ?? null,
      bio: input.bio && input.bio.length > 0 ? input.bio : ' ',
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      externalLinks: input.externalLinks ?? [],
      passwordHash: input.passwordHash,
      accountVisibility: input.accountVisibility ?? 'public',
      role: input.role ?? 'user',
      status: 'active',
      emailVerified: false,
      username: input.username,
      usernameCanonical: input.usernameCanonical,
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserModel | null> {
    return this.userModel.findById(id).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }

  async findProfileById(id: string): Promise<ProfileView | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toProfileView(user) : null;
  }

  async findByUsernameCanonical(usernameCanonical: string): Promise<string | null> {
    const user = await this.userModel.findOne({ usernameCanonical }).exec();
    return user ? this.getUserId(user) : null;
  }

  async updateVerificationStatus(id: string, emailVerified: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { emailVerified }).exec();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { passwordHash }).exec();
  }

  async updateAuthorizationState(
    id: string,
    input: { accountVisibility?: 'public' | 'private'; role?: 'admin' | 'moderator' | 'user' },
  ): Promise<void> {
    await this.userModel.updateOne({ _id: id }, input).exec();
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<ProfileView | null> {
    const update: Record<string, unknown> = {};

    if (input.accountVisibility !== undefined) {
      update.accountVisibility = input.accountVisibility;
    }

    if (input.avatarMediaId !== undefined) {
      update.avatarMediaId = input.avatarMediaId;
    }

    if (input.bio !== undefined) {
      update.bio = input.bio;
    }

    if (input.displayName !== undefined) {
      update.displayName = input.displayName;
    }

    if (input.externalLinks !== undefined) {
      update.externalLinks = input.externalLinks;
    }

    if (input.username !== undefined) {
      update.username = input.username;
      update.usernameCanonical = input.usernameCanonical;
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();
    return updated ? this.toProfileView(updated) : null;
  }
}
