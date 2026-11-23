# Database (Phase 1)

PostgreSQL via Prisma in `packages/database`.

## Core models

- `User` — local studio user (seeded; auth in a later phase).
- `Project` — title, topic, languages[], status, script draft.
- `Scene` — shared storyboard row per project (`sortOrder`, presets, JSON `config`).
- `SceneLocalization` — per scene + locale (`vi` / `en`) narration and subtitles.

Public UUIDs (`publicId`) are used in API routes; bigint `id` values stay internal.

## Commands

```powershell
pnpm db:deploy   # apply migrations (CI / no shadow DB)
pnpm db:migrate  # dev migrations (needs DB lock)
pnpm db:seed     # local studio user
```

## Migrate vs db push

| Command | Use |
|---------|-----|
| `pnpm db:migrate` | Day-to-day schema changes (creates migration files) |
| `pnpm db:push` | Quick local sync **without** migration history (prototypes only) |

If you ran **`db:push` before the first migration**, `db:migrate` reports **drift**. Fix: keep the `init` migration in repo and mark it applied (already done in repo baseline), or on a fresh empty DB run `db:migrate` only.

If drift persists locally after `db:push`, either:

- `pnpm db:baseline` (marks `20251123101000_init` as applied — safe when DB already matches), or
- `dotenv -e ../../.env -- prisma migrate reset` in `packages/database` (wipes dev data) then `pnpm db:migrate`.