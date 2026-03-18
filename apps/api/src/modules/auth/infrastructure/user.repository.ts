import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from './user.schema';

interface CreateUserInput {
  displayName: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UserRepository {
  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserModel>) {}

  async create(input: CreateUserInput): Promise<UserModel> {
    return this.userModel.create({
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      status: 'active',
      emailVerified: false,
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserModel | null> {
    return this.userModel.findById(id).exec();
  }

  async updateVerificationStatus(id: string, emailVerified: boolean): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { emailVerified }).exec();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { passwordHash }).exec();
  }
}
