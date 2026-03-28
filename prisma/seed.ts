import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Check if admin user already exists
  const adminExists = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (adminExists) {
    console.log("✅ Admin user already exists");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
