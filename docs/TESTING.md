# Testing

## Commands

| Command | Scope |
|---------|--------|
| `pnpm lint` | Turbo lint (API + web real ESLint; packages mostly stub) |
| `pnpm typecheck` | All packages with typecheck script |
| `pnpm test` | Turbo test (API unit when configured) |
| `pnpm --filter @ai-video-studio/api test` | API unit tests |
| `pnpm --filter @ai-video-studio/api test:e2e` | API integration (requires PostgreSQL + `.env`) |
| `pnpm build` | Full monorepo production build |

## Phase 1 manual checklist

- [ ] PostgreSQL running; `pnpm db:deploy` applied
- [ ] `pnpm db:seed` (local user)
- [ ] API `start:dev` on `127.0.0.1:3001`
- [ ] Web `dev` on `http://localhost:3000`
- [ ] Dashboard lists projects
- [ ] Create project form → detail page
- [ ] Storyboard editor: save scene fields + VI/EN narration; delete scene
- [ ] Script draft save on project page
- [ ] Dashboard stats cards (`/v1/dashboard/stats`)
- [ ] `GET /v1/system/db` → `{ connected: true }`

See [result_testing/PHASE_1_TEST_REPORT.md](./result_testing/PHASE_1_TEST_REPORT.md) for latest run.