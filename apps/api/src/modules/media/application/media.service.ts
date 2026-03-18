import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import type { AuthorizationPrincipal } from '@suuka/shared-types';

interface UploadedMedia {
  accountVisibility: 'public' | 'private';
  id: string;
  ownerUserId: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  status: 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
}

@Injectable()
export class MediaService {
  private readonly assets: UploadedMedia[] = [];

  list(principal: AuthorizationPrincipal): UploadedMedia[] {
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

  upload(principal: AuthorizationPrincipal, filename: string): UploadedMedia {
    const uploaded: UploadedMedia = {
      accountVisibility: principal.accountVisibility ?? 'public',
      id: crypto.randomUUID(),
      ownerUserId: principal.userId ?? principal.id,
      publicId: `media/${Date.now()}-${filename}`,
      secureUrl: `https://res.cloudinary.com/demo/${filename}`,
      resourceType: 'image',
      status: 'uploaded',
    };
    this.assets.unshift(uploaded);
    return uploaded;
  }
}
