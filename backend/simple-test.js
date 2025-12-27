// simple-test.js
import "dotenv/config";

const token = process.env.TEST_AUTH0_TOKEN;
const url = "https://works-logue-api-dev-561311392240.asia-northeast1.run.app";

if (!token) {
  console.log("❌ TEST_AUTH0_TOKEN not found");
  process.exit(1);
}

console.log("🔑 Token found:", token.substring(0, 20) + "...");

try {
  const response = await fetch(url + "/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("📊 Response status:", response.status);
  const result = await response.text();
  console.log("📝 Response body:", result);
} catch (error) {
  console.error("❌ Error:", error.message);
}
