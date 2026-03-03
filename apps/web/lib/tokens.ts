import { SignJWT, jwtVerify } from "jose";

const TOKEN_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);

export async function createReviewToken(data: {
  storeId: string;
  orderId: string;
  sku: string;
  email: string;
}) {
  return new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(TOKEN_SECRET);
}

export async function verifyReviewToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, TOKEN_SECRET);
    return payload as {
      storeId: string;
      orderId: string;
      sku: string;
      email: string;
    };
  } catch {
    return null;
  }
}
