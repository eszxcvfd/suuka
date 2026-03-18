import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import type { AuthorizationPrincipal } from '@suuka/shared-types';
import type { MediaAssetEntity } from '../domain/media-asset.entity';

@Injectable()
export class MediaService {
  private readonly assets: MediaAssetEntity[] = [];

  list(principal: AuthorizationPrincipal): MediaAssetEntity[] {
    return this.assets.filter((asset) => {
      if (principal.role === 'admin' || principal.role === 'moderator') {
        return true;
      }

      if (asset.ownerUserId === principal.userId) {
        return true;
      }

      return asset.accountVisibility === 'public';
    });
  }

  findOwnedAsset(ownerUserId: string, mediaId: string): MediaAssetEntity | null {
    return (
      this.assets.find(
        (asset) =>
          asset.id === mediaId && asset.ownerUserId === ownerUserId && asset.status !== 'deleted',
      ) ?? null
    );
  }

  resolveAvatarAsset(ownerUserId: string, mediaId: string): MediaAssetEntity | null {
    return (
      this.assets.find(
        (asset) =>
          asset.id === mediaId &&
          asset.ownerUserId === ownerUserId &&
          asset.resourceType === 'image' &&
          asset.status === 'ready',
      ) ?? null
    );
  }

  upload(principal: AuthorizationPrincipal, filename: string): MediaAssetEntity {
    const uploaded: MediaAssetEntity = {
      accountVisibility: principal.accountVisibility ?? 'public',
      id: crypto.randomUUID(),
      ownerUserId: principal.userId ?? principal.id,
      publicId: `media/${Date.now()}-${filename}`,
      secureUrl: `https://res.cloudinary.com/demo/${filename}`,
      resourceType: 'image',
      status: 'ready',
    };
    this.assets.unshift(uploaded);
    return uploaded;
  }
}
