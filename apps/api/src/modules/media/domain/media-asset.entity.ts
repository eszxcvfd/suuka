export interface MediaAssetEntity {
  id: string;
  ownerUserId: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  status: 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
}
