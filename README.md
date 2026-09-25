# TargetWise website

A bilingual Next.js website prepared for Vercel, with MongoDB content management, a shared administrator account, WhatsApp enquiries and installable PWA support.

## What is included

- English `/en` and Arabic `/ar`, with right-to-left Arabic layout.
- Responsive homepage with Services, Work, Packages and About anchor navigation.
- Individual service pages, six editable initial services and editable bilingual copy.
- Service and package pricing in USD, with visibility controls.
- Enquiry dialog that prepares a WhatsApp message with the selected service/package, business, goal and budget. Visitors explicitly send the message in WhatsApp.
- WhatsApp defaults to **96170173853**. Instagram remains hidden until configured.
- `/admin`: shared sign-in, add/edit/delete services, packages, work, testimonials and figures; draft/published controls; ordering; site settings.
- Server-side MongoDB integration, persistent sessions, password hashing, request validation, same-origin write protection and persistent login throttling.
- PWA manifest, approved-logo icons, Apple touch icon and bilingual offline fallback. Admin and API responses are never cached by the service worker.
- Locally bundled web fonts. No runtime Google Fonts request.
- Real approved petrol/ivory logo. The original is preserved at `public/logo-original.png`. Logo and icon exports crop surrounding whitespace/wordmark only; the mark is not redrawn.
- No invented testimonials, client logos, campaign figures, project claims or prices. Those collections start empty. The Work section invites visitors to request relevant examples until real items are published.

## 1. Install and start locally

Use Node.js 22 LTS or newer and npm. This project was built with Node 24.

```bash
npm ci
```

Copy `.env.example` to `.env.local`:

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux / Git Bash**

```bash
cp .env.example .env.local
```

Without MongoDB, the public site runs with the six default services, but admin editing requires the database and credentials below.

## 2. Connect MongoDB Atlas

1. In Atlas, create or select a cluster.
2. Under **Database Access**, create a database user with `readWrite` access to the `targetwise` database. Rotate the password that was previously shared in chat before using the cluster.
3. Under **Network Access**, allow your development IP. For Vercel, configure access for its outbound connectivity. If your plan supports static outbound IPs, allow those. If using dynamic egress and the broad `0.0.0.0/0` rule, use strong unique credentials and database-scoped permissions; this rule makes the endpoint reachable from any IP.
4. Select **Connect → Drivers → Node.js**, copy the connection URI and put it in `.env.local` as `MONGODB_URI`. URL-encode reserved characters in the password.
5. Set `MONGODB_DB=targetwise`. The application selects that database explicitly.

```dotenv
MONGODB_URI="mongodb+srv://YOUR_USER:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER/?appName=TargetWise"
MONGODB_DB=targetwise
```

No destructive migration or seed of your existing database is performed. Use a dedicated empty database for this website. Default services are inserted only when editing services or creating the first package, with insert-only upserts. Work, testimonials, figures and packages start empty.

## 3. Set the shared admin credentials

Run:

```bash
npm run admin:password
```

Enter a password of at least 12 characters in your private terminal. The script prints a salted hash and a random session secret. Input is visible in the terminal, but the plain password is not written into the project.

Fill in:

```dotenv
ADMIN_EMAIL=your-shared-admin-email@example.com
ADMIN_PASSWORD_HASH=PASTE_GENERATED_HASH
SESSION_SECRET=PASTE_GENERATED_SECRET
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The email is the login identifier; this app does not send verification or reset emails. Keep the password in your team's password manager. To reset it, run the command again, replace the hash and session secret, and redeploy. Rotating the secret invalidates existing sessions. Sessions expire after eight hours. The shared account allows at most 20 login attempts in each 15-minute window across the deployment.

Never prefix MongoDB credentials, the hash or the session secret with `NEXT_PUBLIC_`. Never commit `.env.local`.

Start:

```bash
npm run dev
```

Open `http://localhost:3000` and `http://localhost:3000/admin`.

## 4. Add your real content

- **Services:** edit both languages, long descriptions, order, optional price and publication state. IDs become service URL slugs and remain fixed after creation.
- **Packages:** choose the related service, add bilingual scope/details, price and publication state. Put billing periods such as “per month” in the description. All values are USD.
- **Work & results:** add bilingual title, description and context; connect to a service if relevant; add a public HTTPS image URL and optional video link. State the time period and ad spend where needed to interpret real campaign results.
- **Testimonials:** add the client's name and approved quote in both languages, plus an optional video link.
- **Key figures:** add real values, labels and supporting context.
- **Site settings:** edit WhatsApp, Instagram, homepage headline/introduction and agency description in both languages.
- Leave Instagram blank to hide it. WhatsApp uses digits only with country code: `96170173853`.
- Lower order values display first. Drafts stay private to the admin panel.
- Delete or reassign packages before deleting their service.

Images are supported through permanent public URLs (for example, a Cloudinary or Vercel Blob URL). A direct media-file uploader is not included. Videos open as links, so there are no autoplay embeds or third-party iframe dependencies. Service pages show only work and packages linked to that service.

The admin account is shared as requested. There are no separate partner roles, public registration, online payments or customer accounts. Enquiry answers are not saved in MongoDB; the visitor sends them through WhatsApp.

## 5. Deploy to Vercel

1. Create a GitHub repository and push the project folder. Include `package-lock.json`; exclude `.env.local`, `node_modules`, `.next` and test results.
2. In Vercel, select **Add New → Project**, import the repository and select the **Next.js** preset.
3. Set the root directory to the folder containing `package.json` (repository root if you upload this folder's contents).
4. Add `MONGODB_URI`, `MONGODB_DB`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL` under Environment Variables. Paste values without surrounding quotes in the Vercel UI.
5. Set `NEXT_PUBLIC_SITE_URL` to your final HTTPS domain. Select the intended Production and Preview environments. Keep preview databases separate if you want isolated preview content.
6. Use the default build command `npm run build`; leave output directory at the Next.js default. Deploy.
7. Confirm Atlas permits the deployment's database connections. Visit `/admin`, sign in, create a draft, publish it and check the public page.
8. If you change environment variables later, redeploy for the changes to take effect.

The project is prepared for deployment; no live Vercel deployment has been made from this workspace.

## 6. Install as a PWA

- iPhone/iPad: open the HTTPS website in Safari, use Share → Add to Home Screen.
- Android/desktop: use the browser's Install/Add to Home Screen option where supported.
- The icon uses the approved TW mark. The installed app opens English by default; Arabic remains available through the language switch.
- Browsing current content and contacting WhatsApp require a network connection. Offline navigation displays the bilingual fallback. The PWA does not provide push notifications.

## Testing

```bash
npm run build
npm run typecheck
npx playwright install chromium
npm test
```

The full test command launches a disposable local MongoDB instance using `mongodb-memory-server` and a production Next.js server on port 3100. It uses test-only credentials in `scripts/test-server.mjs` and never connects to your Atlas database. First execution downloads a MongoDB binary and requires an environment that permits running native database processes.

The suite covers mobile/desktop, Arabic, service navigation, WhatsApp payloads, admin login/create/update/delete/persistence, settings, protected API writes, manifest and offline fallback.

A limited public-only run is available if native MongoDB cannot start:

```bash
# macOS/Linux/Git Bash
TEST_PUBLIC_ONLY=1 npm test
```

```powershell
# PowerShell
$env:TEST_PUBLIC_ONLY="1"
npm test
Remove-Item Env:TEST_PUBLIC_ONLY
```

For a custom browser binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

See `VALIDATION.md` for the actual checks completed in the build environment and remaining verification.

## Troubleshooting

- **Database unavailable:** check URI, URL-encoded password, database user's privileges and Atlas Network Access.
- **Administrator credentials not configured:** populate all three admin variables; `SESSION_SECRET` must have at least 32 characters. Restart/redeploy after editing environment variables.
- **Invalid origin:** load the site on its own domain; do not submit admin forms from a different origin or an embedded third-party frame.
- **Too many attempts:** wait for the next 15-minute window before trying again.
- **Changes missing:** verify the item is published, both languages are filled, the service relationship is correct, and preview/production use the intended database.
- **Service delete blocked:** remove or reassign packages attached to that service first.
- **Stale icon:** remove the installed PWA and install again; operating systems can retain old home-screen icons.

## Files

- `src/app`: routes, layout, styles and server API handlers.
- `src/components/Site.tsx`: bilingual public website and enquiry flow.
- `src/components/Admin.tsx`: admin forms and content management.
- `src/lib`: database connection, sessions, validation and initial content.
- `public`: approved logo, icons, manifest, service worker and offline page.
- `scripts`: password setup and isolated test server.
- `tests`: Playwright browser/integration tests.

Implementation references: [Next.js cookies](https://nextjs.org/docs/app/api-reference/functions/cookies), [MongoDB Node.js driver](https://github.com/mongodb/node-mongodb-native).
#   t a r g e t w i s e  
 #   t a r g e t w i s e  
 #   t a r g e t w i s e  
 