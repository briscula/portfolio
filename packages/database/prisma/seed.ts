import { PrismaClient } from "@prisma/client";

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding currencies...");

  // Create currencies
  const currencies = [
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    },
    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
    },
    {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
    },
    {
      code: "HKD",
      name: "Hong Kong Dollar",
      symbol: "HK$",
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
    console.log(`✅ Created currency: ${currency.code} - ${currency.name}`);
  }

  console.log("🎉 Currency seeding completed!");
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
