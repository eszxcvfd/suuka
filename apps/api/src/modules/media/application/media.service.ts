import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';

interface UploadedMedia {
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

  list(ownerUserId: string): UploadedMedia[] {
    return this.assets.filter((asset) => asset.ownerUserId === ownerUserId);
  }

  upload(ownerUserId: string, filename: string): UploadedMedia {
    const uploaded: UploadedMedia = {
      id: crypto.randomUUID(),
      ownerUserId,
      publicId: `media/${Date.now()}-${filename}`,
      secureUrl: `https://res.cloudinary.com/demo/${filename}`,
      resourceType: 'image',
      status: 'uploaded',
    };
    this.assets.unshift(uploaded);
    return uploaded;
  }
}
