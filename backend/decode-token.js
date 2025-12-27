// decode-token.js
import "dotenv/config";

const token = process.env.TEST_AUTH0_TOKEN;

if (!token) {
  console.log("❌ TEST_AUTH0_TOKEN not found");
  process.exit(1);
}

// JWTをデコード（検証なし）
const parts = token.split(".");
if (parts.length !== 3) {
  console.log("❌ Invalid JWT format");
  process.exit(1);
}

try {
  // Base64URLデコード
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());

  console.log("🔍 JWT Token Payload:");
  console.log("  iss (issuer):", payload.iss);
  console.log("  aud (audience):", payload.aud);
  console.log("  sub (subject):", payload.sub);
  console.log("  exp (expires):", new Date(payload.exp * 1000).toISOString());
  console.log("  iat (issued at):", new Date(payload.iat * 1000).toISOString());

  console.log("\n📋 Current .env settings:");
  console.log("  AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN);
  console.log("  AUTH0_AUDIENCE:", process.env.AUTH0_AUDIENCE);
  console.log("  AUTH0_ISSUER:", process.env.AUTH0_ISSUER);

  console.log("\n🔍 Comparison:");
  console.log("  Issuer match:", payload.iss === process.env.AUTH0_ISSUER);
  console.log("  Audience match:", payload.aud === process.env.AUTH0_AUDIENCE);

  // 有効期限チェック
  const now = Math.floor(Date.now() / 1000);
  const expired = payload.exp < now;
  console.log("  Token expired:", expired);

  if (expired) {
    console.log("\n❌ Token has expired! Please get a new token.");
  }
} catch (error) {
  console.error("❌ Error decoding token:", error.message);
}
