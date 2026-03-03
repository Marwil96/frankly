import { db } from "./db";
import { stores, accounts } from "./db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
);

export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) return null;

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.apiKey, apiKey))
    .limit(1);

  return store || null;
}

export async function validateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { accountId: string; storeId: string; role: string };
  } catch {
    return null;
  }
}

export async function createAdminToken(accountId: string, storeId: string) {
  return new SignJWT({ accountId, storeId, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyLogin(email: string, password: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email.toLowerCase()))
    .limit(1);

  if (!account) return null;

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) return null;

  return account;
}

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}
