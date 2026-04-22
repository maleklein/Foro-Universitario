// src/lib/validations/auth.schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),

  email: z
    .string()
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),

  fullName: z
    .string()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(100, 'El nombre completo no puede exceder 100 caracteres'),

  birthDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de nacimiento inválida')
    .transform((date) => new Date(date))
    .refine((date) => {
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 16;
    }, 'Debes tener al menos 16 años'),

  sex: z.enum(['M', 'F', 'Otro'], {
    message: 'Sexo debe ser M, F u Otro',
  }),

  faculty: z
    .string()
    .min(1, 'La facultad es requerida')
    .max(50, 'Nombre de facultad demasiado largo'),

  career: z
    .string()
    .min(1, 'La carrera es requerida')
    .max(100, 'Nombre de carrera demasiado largo'),

  entryYear: z
    .number({ message: 'Año de ingreso debe ser un número' })
    .int('Año de ingreso debe ser entero')
    .min(1990, 'Año de ingreso no puede ser anterior a 1990')
    .max(new Date().getFullYear(), 'Año de ingreso no puede ser futuro'),

  captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token requerido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Token requerido')
    .regex(/^mock-token-.+$/, 'Formato de token inválido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;