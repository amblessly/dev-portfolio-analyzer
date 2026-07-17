import { db } from "../src/lib/db/prisma";

async function main() {
  const admin = await db.user.upsert({
    where: { email: "admin@devportfolioanalyzer.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@devportfolioanalyzer.com",
      emailVerified: true,
      role: "ADMIN",
    },
  });
  console.log("Seeded admin user:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
