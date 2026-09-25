# Validation record

## Passed in this workspace

- `npm run build`: optimized Next.js production build and TypeScript compilation.
- `npm run typecheck`: independent TypeScript check.
- Playwright public-only suite: **2 passed, 1 explicitly skipped**.
- Desktop homepage and service detail navigation.
- Mobile navigation, 390px viewport and no horizontal overflow.
- Arabic language switching, right-to-left document and no horizontal overflow.
- WhatsApp message includes the correct international number, selected service and form answers.
- Anonymous API mutation returns 401.
- Cross-origin API mutation returns 403.
- PWA manifest icons and successful offline navigation fallback.
- Visual inspection of desktop, mobile and Arabic screenshots.

## Not verified here

- Admin login and MongoDB create/update/delete persistence integration test: the workspace blocked the temporary native MongoDB process with `Operation not permitted`. The full test is included and must be run in a compatible local environment or CI before production use.
- Connection to the user's live MongoDB Atlas cluster. Shared credentials were not used or embedded.
- Live Vercel deployment and device-specific iOS/Android home-screen installation. The project and deployment guide are prepared; no hosted site was published.

The public-only checks use the real production build. The admin integration test is not represented as passing. The native database limitation does not get replaced with an in-memory imitation in production code.
