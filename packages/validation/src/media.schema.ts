import { z } from 'zod';

export const uploadMediaSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  bytes: z.number().int().positive(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
