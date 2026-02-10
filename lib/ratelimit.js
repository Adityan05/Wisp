import { query } from "@/lib/db";

export async function rateLimit(ip, endpoint, limit = 3, windowSec = 90) {
  const now = new Date();

  const windowEnd = new Date(now.getTime() + windowSec * 1000);

  const result = await query(
    `INSERT INTO rate_limits (ip, endpoint, count, expires_at) VALUES ($1, $2, 1, $3) ON CONFLICT(ip, endpoint) DO UPDATE SET count = CASE WHEN rate_limits.expires_at < $4 THEN 1 ELSE rate_limits.count + 1 END, expires_at = CASE WHEN rate_limits.expires_at < $4 THEN $3 ELSE rate_limits.expires_at END RETURNING count`,
    [ip, endpoint, windowEnd, now],
  );

  const currentCount = result.rows[0].count;

  return {
    success: currentCount <= limit,
    remaining: Math.max(0, limit - currentCount),
  };
}
