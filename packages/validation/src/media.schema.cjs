const { z } = require('zod');

const uploadMediaSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  bytes: z.number().int().positive(),
});

module.exports = {
  uploadMediaSchema,
};
