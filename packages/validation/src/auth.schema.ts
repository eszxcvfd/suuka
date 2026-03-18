import { z } from 'zod';

export const authorizationRoleSchema = z.enum(['admin', 'moderator', 'user']);
export const accountVisibilitySchema = z.enum(['public', 'private']);
export const internalScopeGrantSchema = z.object({
  scopes: z.array(z.string().min(1)).min(1),
  serviceName: z.string().min(2),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(60),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const updateRoleSchema = z.object({
  role: authorizationRoleSchema,
});

export const updateAccountVisibilitySchema = z.object({
  visibility: accountVisibilitySchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateAccountVisibilityInput = z.infer<typeof updateAccountVisibilitySchema>;
export type InternalScopeGrantInput = z.infer<typeof internalScopeGrantSchema>;
