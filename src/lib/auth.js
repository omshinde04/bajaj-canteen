import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bajaj_enterprise_secure_jwt_secret_key_2026";
const TOKEN_EXPIRY = "8h"; // Industrial shift-aligned session duration

/**
 * Hash raw password using bcrypt with salt rounds
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password against stored hash
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Sign JWT token with payload
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(req) {
  if (!req || !req.headers) return null;

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [k, ...v] = c.split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    if (cookies["bajaj_token"]) {
      return cookies["bajaj_token"];
    }
  }

  return null;
}
