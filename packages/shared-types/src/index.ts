export type UserStatus = 'active' | 'suspended' | 'deleted';
export type MediaStatus = 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  status: UserStatus;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface MediaAsset {
  id: string;
  ownerUserId: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  status: MediaStatus;
}
