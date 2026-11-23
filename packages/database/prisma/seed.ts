import { PrismaClient } from '@prisma/client';

const LOCAL_STUDIO_EMAIL = 'local-studio@ai-video-studio.local';
const LOCAL_STUDIO_USER_PUBLIC_ID = '00000000-0000-4000-8000-000000000001';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: LOCAL_STUDIO_EMAIL },
    update: { displayName: 'Local Studio' },
    create: {
      publicId: LOCAL_STUDIO_USER_PUBLIC_ID,
      email: LOCAL_STUDIO_EMAIL,
      displayName: 'Local Studio',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });