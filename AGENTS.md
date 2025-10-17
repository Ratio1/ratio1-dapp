# Repository Guidelines

## Project Structure & Module Organization
The dApp runs on Vite + React + TypeScript. `src/main.tsx` mounts `App.tsx` and registers shared providers. Page-level views live in `src/pages`, while reusable UI is grouped in `src/components` (e.g., `components/Invoicing`, `components/Mobile`). Web3 contract wrappers and ABI files sit in `src/blockchain` (`Reader.ts`, `PoAIContract.ts`, `abi.json`). Shared types and helpers are under `src/typedefs`, `src/schemas`, `src/lib`, and `src/shared`. Static assets belong in `public/`; builds emit to `dist/`. The release workflow `.github/workflows/release.yml` builds with Node 18 before archiving the bundle.

## Build, Test, and Development Commands
- `npm install` syncs dependencies; use Node 18 as in CI.
- `npm run dev` starts the Vite dev server; `npm run dev:logs` adds verbose network/debug output.
- `npm run build` runs `tsc -b` and `vite build`, producing `/dist` (CI injects `VITE_APP_VERSION`).
- `npm run lint` applies ESLint across the tree; run it before pushing.
- `npm run preview` serves the build locally; `npm run serve` mirrors static hosting.

## Coding Style & Naming Conventions
Prettier enforces four-space indentation, 128-character lines, semicolons, single quotes, and Tailwind class sorting (`.prettierrc`). Components, pages, and hooks use PascalCase (`ProtectedAdminRoute.tsx`); utilities use camelCase; blockchain wrappers mirror contract names. Favor typed props and `z.infer` outputs from `src/schemas`; even though `any` is allowed, avoid introducing it. Keep styling in Tailwind utility classes or scoped rules in `src/index.css`.

## Testing Guidelines
Automated tests are not yet configured; adopt Vitest + React Testing Library for new suites and co-locate specs (`components/TokenSelectorModal.test.tsx`). Until coverage exists, run `npm run build` and manually walk wallet connect, invoicing, and faucet flows before opening a PR. For changes in `src/schemas` or `src/blockchain`, include manual test notes in the PR and add unit tests when you add deterministic logic.

## Commit & Pull Request Guidelines
History follows Conventional Commits (`feat`, `fix`, `chore`, `refactor`); keep messages imperative and scoped so semantic releases choose the right version. Squash incidental WIP commits. PRs should include a concise summary, linked issue or ticket, screenshots/GIFs for UI updates, notes on new environment variables, and contract deployment details (addresses, tx hashes) when Web3 code changes.

## Security & Configuration Tips
Secrets belong in `.env`; never commit keys. Use `VITE_` prefixes for variables that must reach the client runtime. Double-check contract addresses and chain IDs before shipping Web3 changes, and exercise wallet connection flows with a test account.
