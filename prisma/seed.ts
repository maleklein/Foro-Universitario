// prisma/seed.ts
import { PrismaClient } from '../src/lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Cargar variables de entorno
dotenv.config();

// Inicializar Prisma con adaptador para SQLite
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------
// Funciones auxiliares
// ------------------------------------------------------------

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ------------------------------------------------------------
// Función principal de seed
// ------------------------------------------------------------

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar tablas en orden (respetando dependencias)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.savedContent.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.subforum.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.file.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Creando usuarios...');

  // Contraseña única para todos los usuarios del seed: Password1
  const passwordHash = await bcrypt.hash('Password1', 10);

  const usersData = [
    { username: 'admin', fullName: 'Admin Principal', role: 'admin', verified: true },
    { username: 'moderador1', fullName: 'Moderador Uno', role: 'moderator', verified: true },
    { username: 'moderador2', fullName: 'Moderador Dos', role: 'moderator', verified: true },
    { username: 'verificado1', fullName: 'Juan Pérez', role: 'verified', verified: true },
    { username: 'verificado2', fullName: 'María Gómez', role: 'verified', verified: true },
    { username: 'verificado3', fullName: 'Carlos Ruiz', role: 'verified', verified: true },
    { username: 'verificado4', fullName: 'Ana López', role: 'verified', verified: true },
    { username: 'usuario1', fullName: 'Pedro Sánchez', role: 'user', verified: false },
    { username: 'usuario2', fullName: 'Lucía Fernández', role: 'user', verified: false },
    { username: 'usuario3', fullName: 'Miguel Torres', role: 'user', verified: false },
  ];

  const createdUsers = [];
  const now = new Date();

  for (const u of usersData) {
    const emailVerifiedAt = u.verified ? randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now) : null;
    const verificationStatus = u.verified ? 'approved' : (u.role === 'user' ? null : 'pending');
    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: `${u.username}@uap.edu.ar`,
        passwordHash,
        fullName: u.fullName,
        birthDate: new Date(1995, 0, 1),
        sex: randomItem(['M', 'F']),
        faculty: randomItem(['FCI', 'FCE', 'FTH', 'FMO']),
        career: 'Ingeniería Informática',
        entryYear: randomInt(2018, 2023),
        bio: `Soy ${u.fullName}, estudiante de la UAP.`,
        avatar: `https://i.pravatar.cc/150?u=${u.username}`,
        role: u.role as any,
        emailVerified: u.verified,
        emailVerifiedAt,
        verificationStatus: verificationStatus as any,
        createdAt: randomDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), now),
      },
    });
    createdUsers.push(user);
    console.log(`  ✅ ${u.username} (${u.role})`);
  }

  const admin = createdUsers[0];
  const moderators = createdUsers.slice(1, 3);
  const verifiedUsers = createdUsers.slice(3, 7);
  const normalUsers = createdUsers.slice(7);

  console.log('🏛️ Creando foros...');
  const forumsData = [
    { name: 'Facultad de Ciencias Informáticas', faculty: 'FCI', description: 'Foro para estudiantes de informática' },
    { name: 'Facultad de Ciencias Económicas', faculty: 'FCE', description: 'Discusiones sobre economía, administración y contabilidad' },
    { name: 'Facultad de Turismo y Hotelería', faculty: 'FTH', description: 'Foro de turismo y hotelería' },
    { name: 'Facultad de Medicina y Odontología', faculty: 'FMO', description: 'Foro de ciencias de la salud' },
    { name: 'General', faculty: null, description: 'Temas generales de la universidad' },
  ];

  const createdForums = [];
  for (const f of forumsData) {
    const forum = await prisma.forum.create({ data: f as any });
    createdForums.push(forum);
    console.log(`  ✅ ${f.name}`);
  }

  console.log('📁 Creando subforos...');
  const subforumsData = [
    { forumId: createdForums[0].id, name: 'Programación I', tags: ['Java', 'POO', 'Algoritmos'] },
    { forumId: createdForums[0].id, name: 'Programación II', tags: ['Estructuras', 'C++', 'Memoria'] },
    { forumId: createdForums[0].id, name: 'Programación III', tags: ['Web', 'React', 'Node'] },
    { forumId: createdForums[0].id, name: 'Base de Datos', tags: ['SQL', 'NoSQL', 'Modelado'] },
    { forumId: createdForums[1].id, name: 'Microeconomía', tags: ['Oferta', 'Demanda', 'Mercados'] },
    { forumId: createdForums[1].id, name: 'Macroeconomía', tags: ['PBI', 'Inflación', 'Política'] },
    { forumId: createdForums[1].id, name: 'Contabilidad I', tags: ['Balance', 'Asientos', 'Estados'] },
    { forumId: createdForums[2].id, name: 'Gestión Hotelera', tags: ['Hoteles', 'Revenue', 'Servicio'] },
    { forumId: createdForums[2].id, name: 'Turismo Sustentable', tags: ['Ecoturismo', 'Sostenibilidad'] },
    { forumId: createdForums[3].id, name: 'Anatomía', tags: ['Cuerpo', 'Sistemas', 'Disección'] },
    { forumId: createdForums[3].id, name: 'Farmacología', tags: ['Medicamentos', 'Dosis', 'Interacciones'] },
    { forumId: createdForums[4].id, name: 'Novedades', tags: ['Anuncios', 'Eventos'] },
    { forumId: createdForums[4].id, name: 'Charlas y Debates', tags: ['Opinión', 'Universidad'] },
    { forumId: createdForums[4].id, name: 'Ayuda', tags: ['Dudas', 'Técnico'] },
  ];

  const createdSubforums = [];
  for (const sf of subforumsData) {
    const subforum = await prisma.subforum.create({
      data: {
        ...sf,
        tags: JSON.stringify(sf.tags),
      },
    });
    createdSubforums.push(subforum);
    console.log(`  ✅ ${sf.name}`);
  }

  console.log('🧵 Creando hilos...');
  const threadsData = [];
  const threadTitles = [
    'Duda sobre recursividad en Java',
    '¿Cómo manejar memoria dinámica en C++?',
    'Proyecto final: aplicación web con React y Node',
    'Normalización de base de datos hasta 3FN',
    'Ejercicio de elasticidad precio de la demanda',
    'Inflación y tipo de cambio: relación',
    'Asientos de ajuste - Ejemplo práctico',
    'Revenue Management en hoteles pequeños',
    'Ecoturismo en Misiones: experiencias',
    'Huesos del cráneo: mnemotecnias',
    'Interacciones medicamentosas comunes',
    'Nuevo sistema de inscripciones',
    'Debate: ¿presencialidad o virtualidad?',
    'Problema con el campus virtual',
  ];

  const statuses: ('active' | 'closed' | 'deleted')[] = ['active', 'active', 'active', 'active', 'closed', 'closed', 'deleted', 'active'];

  for (let i = 0; i < 30; i++) {
    const title = i < threadTitles.length ? threadTitles[i] : `Hilo de ejemplo ${i + 1}`;
    const slug = generateSlug(title);
    const author = randomItem([...verifiedUsers, ...normalUsers, ...moderators]);
    const subforum = randomItem(createdSubforums);
    const createdAt = randomDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), now);
    const status = randomItem(statuses);
    const pinned = i < 2 ? true : false;
    const thread = await prisma.thread.create({
      data: {
        title,
        slug,
        content: `<p>Este es el contenido del hilo "${title}". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        status: status as any,
        pinned,
        authorId: author.id,
        subforumId: subforum.id,
        viewCount: randomInt(10, 500),
        closedReason: status === 'closed' ? 'Hilo cerrado por inactividad' : null,
        deletedReason: status === 'deleted' ? 'Contenido fuera de tema' : null,
        deletedById: status === 'deleted' ? randomItem(moderators).id : null,
        createdAt,
        updatedAt: randomDate(createdAt, now),
      },
    });
    threadsData.push(thread);
  }
  console.log(`  ✅ 30 hilos creados`);

  console.log('💬 Creando comentarios...');
  const commentsData = [];
  for (let i = 0; i < 100; i++) {
    const thread = randomItem(threadsData.filter(t => t.status !== 'deleted'));
    const author = randomItem([...verifiedUsers, ...normalUsers, ...moderators]);
    const createdAt = randomDate(thread.createdAt, now);
    const comment = await prisma.comment.create({
      data: {
        content: `Este es un comentario de ejemplo #${i + 1} en respuesta al hilo. Aporta información relevante al debate.`,
        authorId: author.id,
        threadId: thread.id,
        createdAt,
        updatedAt: randomDate(createdAt, now),
      },
    });
    commentsData.push(comment);
  }
  console.log(`  ✅ 100 comentarios creados`);

  // Agregar algunas citas
  for (let i = 0; i < 20; i++) {
    const comment = commentsData[randomInt(0, commentsData.length - 1)];
    const quoteComment = commentsData.find(c => c.threadId === comment.threadId && c.id !== comment.id);
    if (quoteComment) {
      await prisma.comment.update({
        where: { id: comment.id },
        data: { quotedCommentId: quoteComment.id },
      });
    }
  }

  console.log('👍👎 Creando votos...');

// Votos en hilos
for (let i = 0; i < 60; i++) {
  const thread = randomItem(threadsData.filter(t => t.status === 'active'));
  const user = randomItem(createdUsers);

  const existing = await prisma.vote.findFirst({
    where: {
      userId: user.id,
      targetId: thread.id,
      targetType: 'Thread',
    },
  });

  if (!existing) {
    try {
      await prisma.vote.create({
        data: {
          userId: user.id,
          targetId: thread.id,
          targetType: 'Thread',
          value: Math.random() > 0.3 ? 1 : -1,
        },
      });
    } catch (e) {
      // ignorar error de duplicado
    }
  }
}

// Votos en comentarios
for (let i = 0; i < 120; i++) {
  const comment = randomItem(commentsData);
  const user = randomItem(createdUsers);

  const existing = await prisma.vote.findFirst({
    where: {
      userId: user.id,
      targetId: comment.id,
      targetType: 'Comment',
    },
  });

  if (!existing) {
    try {
      await prisma.vote.create({
        data: {
          userId: user.id,
          targetId: comment.id,
          targetType: 'Comment',
          value: Math.random() > 0.2 ? 1 : -1,
        },
      });
    } catch (e) {
      // ignorar
    }
  }
}
  console.log('🎉 Seed completado exitosamente.');
}

// ------------------------------------------------------------
// Ejecutar seed
// ------------------------------------------------------------

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });