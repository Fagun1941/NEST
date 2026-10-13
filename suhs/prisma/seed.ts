import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@suhs.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Seeded initial admin user: ${admin.email} (Role: ${admin.role})`);
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN },
    });
    console.log(`ℹ️ Admin user (${existingAdmin.email}) already exists, ensured role is ADMIN.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
