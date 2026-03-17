export interface UserEntity {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  status: 'active' | 'suspended' | 'deleted';
}
