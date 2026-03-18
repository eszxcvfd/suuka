import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthorizationPrincipal, ProfileView } from '@suuka/shared-types';
import type { UpdateAvatarInput, UpdateProfileInput } from '@suuka/validation';
import type { ProfileExternalLinkInput } from '@suuka/validation';
import { UserRepository } from '../../auth/infrastructure/user.repository';
import { AuthorizationService } from '../../authorization/application/authorization.service';
import { MediaService } from '../../media/application/media.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly userRepository: UserRepository,
    private readonly mediaService: MediaService,
  ) {}

  private async requireProfile(userId: string): Promise<ProfileView> {
    const profile = await this.userRepository.findProfileById(userId);
    if (!profile) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return profile;
  }

  private normalizeProfile(profile: ProfileView): ProfileView {
    return {
      ...profile,
      avatarUrl: profile.avatarUrl ?? null,
      bio: profile.bio ?? '',
      externalLinks: profile.externalLinks ?? [],
    };
  }

  private normalizeUsername(username: string | undefined): {
    username: string | undefined;
    usernameCanonical: string | undefined;
  } {
    if (!username) {
      return {
        username: undefined,
        usernameCanonical: undefined,
      };
    }

    const normalized = username.trim();

    return {
      username: normalized,
      usernameCanonical: normalized.toLowerCase(),
    };
  }

  private normalizeExternalLinks(
    externalLinks: ProfileExternalLinkInput[] | undefined,
  ): ProfileExternalLinkInput[] | undefined {
    if (!externalLinks) {
      return undefined;
    }

    return externalLinks.map((link) => ({
      id: link.id.trim(),
      label: link.label.trim(),
      url: link.url.trim(),
    }));
  }

  async getCurrentProfile(userId: string): Promise<ProfileView> {
    return this.normalizeProfile(await this.requireProfile(userId));
  }

  async getProfileByAccountId(
    accountId: string,
    principal: AuthorizationPrincipal,
  ): Promise<ProfileView> {
    const profile = this.normalizeProfile(await this.requireProfile(accountId));
    const decision = this.authorizationService.evaluate(principal, {
      action: 'profile:read',
      ownerUserId: accountId,
      visibility: profile.accountVisibility,
    });

    if (!decision.allowed) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return profile;
  }

  async updateCurrentProfile(
    userId: string,
    input: UpdateProfileInput,
    principal: AuthorizationPrincipal,
  ): Promise<ProfileView> {
    const decision = this.authorizationService.evaluate(principal, {
      action: 'profile:update',
      ownerUserId: userId,
      visibility: input.accountVisibility ?? principal.accountVisibility ?? 'public',
    });

    if (!decision.allowed) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Profile update is not allowed' });
    }

    const { username, usernameCanonical } = this.normalizeUsername(input.username);
    if (usernameCanonical) {
      const ownerOfUsername = await this.userRepository.findByUsernameCanonical(usernameCanonical);
      if (ownerOfUsername && ownerOfUsername !== userId) {
        throw new ConflictException({
          code: 'USERNAME_TAKEN',
          message: 'Username is already reserved by another profile',
        });
      }
    }

    const updated = await this.userRepository.updateProfile(userId, {
      accountVisibility: input.accountVisibility,
      bio: input.bio,
      displayName: input.displayName,
      externalLinks: this.normalizeExternalLinks(input.externalLinks),
      username,
      usernameCanonical,
    });

    if (!updated) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return this.normalizeProfile(updated);
  }

  async updateAvatar(userId: string, input: UpdateAvatarInput): Promise<ProfileView> {
    if (input.mediaId) {
      const asset = this.mediaService.resolveAvatarAsset(userId, input.mediaId);
      if (!asset) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Avatar media must be a ready image owned by the current user',
        });
      }
    }

    const updated = await this.userRepository.updateProfile(userId, {
      avatarMediaId: input.mediaId ?? null,
    });

    if (!updated) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Profile not found' });
    }

    return this.normalizeProfile(updated);
  }
}
