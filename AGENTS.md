<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Beauty Clinic Booking App (MCS_MPR_F26_julia_298202)

Next.js 16 (App Router) + React 19 + Prisma 7 + PostgreSQL + Tailwind v4 + shadcn. Single-package project — use **pnpm** for everything, not npm.

## Commands
- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm typecheck` (tsc --noEmit) · `pnpm lint` · `pnpm format` (prettier; only covers `**/*.{ts,tsx}`)
- No test runner or CI yet.

## README is design intent, not a finished map
The intended structure (client/admin route groups, `src/`, server actions) is built out incrementally — don't expect it all to exist. Code lives at the repo root today; there is no `src/`. The `@/*` alias maps to the repo root (see `tsconfig.json` paths).

## Prisma 7 (non-default setup, easy to get wrong)
- The client is generated into `generated/prisma/` (gitignored) and imported from there — **not** `@prisma/client`. Follow `lib/prisma.ts`: import from `../generated/prisma/index` and instantiate `PrismaClient` with the `PrismaPg` adapter from `@prisma/adapter-pg`. Do NOT import from `../generated/prisma/client` — that entry is a thin re-export whose model delegates don't wire up under `tsx`.
- The generated client requires `@prisma/client-runtime-utils@<same version>` from the **project root** `node_modules` (Turbopack can't resolve it via pnpm's `.pnpm` hidden hoist). `@prisma/client-runtime-utils@7.8.0` is pinned in `package.json`; if the Prisma version changes, bump it to match — otherwise the dev server fails with `Module not found: Can't resolve '@prisma/client-runtime-utils'`.
- `prisma/schema.prisma` has no `url` in the datasource; the connection comes from `DATABASE_URL` via `prisma.config.ts` / `import "dotenv/config"`.
- Run `pnpm prisma generate` after schema changes — generated types are not committed, so `typecheck`/`build` fail without them.
- `generated/**` is ignored by ESLint (`eslint.config.mjs` `globalIgnores`) and Prettier (`.prettierignore`) — the generated CJS bundle does not lint clean.

## Auth
- Use **Better Auth** (chosen over NextAuth/Auth.js); not wired up yet — integrate via Better Auth's Prisma adapter when you get there.
- README env examples named `NEXTAUTH_SECRET`/`NEXTAUTH_URL` are stale; Better Auth uses `BETTER_AUTH_SECRET`/`BETTER_AUTH_URL`.
- Auth config belongs in `lib/auth.ts`; roles are `CLIENT` / `ADMIN`, enforced via middleware + server-side session checks.

## Styling / UI
- Tailwind v4 is CSS-first config in `app/globals.css` (`@theme`, `@custom-variant`) — there is no `tailwind.config`.
- shadcn uses the `base-rhea` style on **Base UI** (`@base-ui/react`), not Radix. Add components with `pnpm shadcn add <name>` into `components/ui`.
- Prettier-enforced style: no semicolons, double quotes, `trailingComma: es5`.