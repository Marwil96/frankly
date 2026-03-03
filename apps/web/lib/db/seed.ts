import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { stores, accounts } from "./schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  const storeId = crypto.randomUUID();
  const apiKey = `fk_${nanoid(32)}`;

  await db.insert(stores).values({
    id: storeId,
    name: "Demo Store",
    domain: "localhost",
    apiKey,
    moderationEnabled: true,
    emailDelayDays: 14,
    emailEnabled: true,
    locale: "en",
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.insert(accounts).values({
    email: "admin@frankly.dev",
    passwordHash,
    storeId,
  });

  console.log(`Store created: ${storeId}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`Admin login: admin@frankly.dev / admin123`);

  await client.end();
}

seed();
