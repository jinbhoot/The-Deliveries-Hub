import { SignJWT, jwtVerify } from "jose";

export type TokenPayload = {
  id: string;
  role: "client" | "rider" | "admin";
  fullName: string;
  email: string;
};

export const AUTH_COOKIE_NAME = "deliveries_hub_token";

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "deliveries_hub_default_secret_key_build_fallback_32_bytes";
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: TokenPayload) {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

