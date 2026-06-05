// lib/validations/auth.ts
// =============================================================================
// Zod Schema — Validasi input login
// =============================================================================

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
