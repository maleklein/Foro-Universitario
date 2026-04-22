// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { registerSchema } from '@/lib/validations';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Parsear y validar body con Zod
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de registro inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, email, password, fullName, birthDate, sex, faculty, career, entryYear } =
      validation.data;

    // 2. Verificar unicidad de email y username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { error: `El ${conflictField} ya está registrado` },
        { status: 409 }
      );
    }

    // 3. Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Mock de CAPTCHA y envío de email
    console.log(`[MOCK] CAPTCHA validado para ${email}`);
    console.log(`[MOCK] Email de verificación enviado a ${email}`);

    // 5. Crear usuario en DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        birthDate: new Date(birthDate),
        sex,
        faculty,
        career,
        entryYear,
        emailVerified: false,
        role: 'user',
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        birthDate: true,
        sex: true,
        faculty: true,
        career: true,
        entryYear: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 6. Retornar 201 con usuario creado
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}