/**
 * Authorize a blog revalidation request.
 *
 * Two callers are accepted:
 *  - Vercel Cron (GET) — Vercel injects `Authorization: Bearer $CRON_SECRET`
 *    when the `CRON_SECRET` env var is configured.
 *  - A publish webhook / manual call — `?secret=$BLOG_REVALIDATE_SECRET`.
 *
 * If neither secret is configured in the environment, every request is rejected
 * (fail closed), so the endpoint is never left publicly open by accident.
 */
export function isBlogRevalidateAuthorized(
  authHeader: string | null,
  secret: string | null,
): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const revalidateSecret = process.env.BLOG_REVALIDATE_SECRET;
  if (revalidateSecret && secret === revalidateSecret) return true;

  return false;
}
