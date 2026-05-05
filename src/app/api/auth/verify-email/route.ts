// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailSchema } from '@/lib/validations';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar body con Zod
    const body = await req.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Token inválido',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // 2. Parsear userId del token (formato: mock-token-{userId})
    const userId = token.replace('mock-token-', '');

    // 3. Buscar usuario en DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 4. Verificar si el email ya fue verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email ya verificado' },
        { status: 400 }
      );
    }

    // 5. Actualizar estado de verificación
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // 6. Retornar 200 con mensaje de éxito
    return NextResponse.json(
      { message: `Email ${user.email} verificado correctamente` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en verificación de email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
