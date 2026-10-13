# OrbitDesk — Full-Stack Deployment Project

Professional responsive project planner: interactive Three.js orbital hero, private project boards, Express API, PostgreSQL persistence, dark/light themes, search, filters, priority/due-date sorting, progress statistics, overdue highlights and JSON export.

## Status
Source provided; not yet installed, browser-tested, database-tested or deployed in the generation environment. Run the checks below before claiming a verified live deployment. This is vanilla JavaScript + Vite, not React. Board keys are secret access credentials, not user-account login. Anyone with a key has full board access. No lost-key recovery, email, payments or file uploads are included.

## 1. Create/open the folder
Extract the ZIP and open its orbitdesk folder using VS Code > File > Open Folder. Alternatively create an empty orbitdesk folder and copy each file into the structure below. Open Terminal > New Terminal in that folder. Do not run create-vite over the supplied project.

```text
orbitdesk/
  package.json
  index.html
  vite.config.js
  .gitignore
  .env.example
  README.md
  src/main.js
  src/scene.js
  src/style.css
  server/index.js
  server/db.js
  server/schema.sql
  server/setup.js
  postman/OrbitDesk.postman_collection.json
  postman/local.postman_environment.json
  postman/production.postman_environment.json
```
style.css is a valid filename. Ensure it is not style.css.txt. Its import is in src/main.js.

## 2. Install prerequisites and dependencies
Install Node.js (supported LTS; Node 22.12+ in the 22 line is suitable), Git, PostgreSQL server, pgAdmin 4, VS Code and Postman. pgAdmin is a client; the database server must also be running.

```sh
node --version
npm --version
npm install
```
Run commands in the project root. npm install generates package-lock.json: commit it for reproducible installs. The download does not fabricate a lockfile because dependency installation was not executed. Later use npm ci.

## 3. Create database with pgAdmin 4
1. Open pgAdmin; expand Servers > PostgreSQL.
2. Enter your PostgreSQL server password if requested.
3. Right-click Databases > Create > Database.
4. Name: orbitdesk. Save.
5. Right-click orbitdesk > Query Tool.
6. Copy all of server/schema.sql into the Query Tool and Execute.
7. Run:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```
Expected tables: boards, projects. CREATE TABLE IF NOT EXISTS is rerunnable but is not a migration system for future schema changes.

## 4. Configure environment
Copy .env.example to .env in the root.
PowerShell:
```powershell
Copy-Item .env.example .env
```
macOS/Linux:
```sh
cp .env.example .env
```
Edit .env:
```dotenv
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_URL_ENCODED_PASSWORD@localhost:5432/orbitdesk
APP_ORIGIN=http://localhost:5173
DB_SSL=false
```
Replace username/password/port with your real PostgreSQL settings. URL-encode reserved password characters, e.g. @ -> %40 and # -> %23. Do not commit .env or share credentials. Never put a database connection string in frontend code.

Alternative to manually running schema.sql:
```sh
npm run db:setup
```

## 5. Start API
Terminal 1:
```sh
npm run server
```
Keep it open. Visit http://localhost:5000/api/health . Expect:
```json
{"status":"ok","database":"connected"}
```
503 means PostgreSQL is unavailable. This checks a database connection, not table existence; CRUD tests verify the tables.

## 6. Start website
Terminal 2 in the same folder:
```sh
npm run dev
```
Open Vite's printed URL, normally http://localhost:5173 . If Vite picks another port, update APP_ORIGIN and restart the backend. Its /api proxy targets port 5000.

1. Click Create private board.
2. Save the key privately in a password manager; close the key dialog.
3. Click New project, complete the fields, and save.
4. Edit, complete and delete test projects.
5. Test filters, search, sorting, theme, export and page refresh.
6. Click Board key > Disconnect, then restore using the saved key.

The browser stores a key in localStorage; clearing site data removes that copy, not database records. The server stores only the key's SHA-256 hash. Keys grant full access; do not share or place in URLs. JSON export excludes the key; JSON import is not implemented.

## 7. Verify actual database persistence
In pgAdmin Query Tool:
```sql
SELECT id,title,status,progress,due_date,created_at
FROM projects ORDER BY created_at DESC;
SELECT id,created_at FROM boards ORDER BY created_at DESC;
```
Create/edit a browser project and rerun these queries. Refresh the website: records must persist. This proves browser -> API -> PostgreSQL -> browser.

## 8. Postman smoke tests
1. Postman > Import > postman/OrbitDesk.postman_collection.json.
2. Import postman/local.postman_environment.json.
3. Select OrbitDesk local environment.
4. Confirm baseUrl is http://localhost:5000 without trailing slash.
5. Run all eleven collection requests in numbered order.
6. Investigate any failed assertion before deployment.

Coverage: health/database connection, 401 without key, board creation, 400 invalid input, project creation, persisted read, update, persisted update, deletion, persisted deletion and 404 after deletion.

Scripts automatically capture boardToken and projectId as collection variables. Do not create environment variables of the same names, which would override them. Tests use pm.test and pm.expect in Scripts > Post-response.

CLI:
```sh
npm run smoke
```
The suite creates a separate test board, writes one temporary project and deletes the project. The board remains. Do not run it with your working board key. Clear captured collection keys before exporting/publishing the collection. If tests stop midway, inspect and delete leftover test projects. Board creation is limited to 20 per hour per IP, API requests to 120 per minute per IP.

## 9. Test production build locally
Stop the watch server first:
```sh
npm run build
npm start
```
Open http://localhost:5000 . Express now serves both dist and /api. Test CRUD, refresh and Postman again. npm start requires a built dist folder. Source changes require another build.

## 10. Push to GitHub
Create an empty repository named orbitdesk. Then:
```sh
git init
git add .
git commit -m "Build OrbitDesk full-stack project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/orbitdesk.git
git push -u origin main
```
Replace YOUR_USERNAME. Review staged files first. Commit package-lock.json, .env.example and source; never .env, node_modules or real keys. Rotate accidentally published secrets immediately; deleting the file does not erase history.

## 11. Deploy (Render example)
Use a platform approved by your program. Check current costs, expiry limits and backup policy before creating services. This architecture uses ONE Node web service serving frontend and API, plus PostgreSQL. It does not need separate frontend hosting or a public VITE_API_URL.

### A. Database
Render Dashboard > New > Postgres. Choose a suitable plan and region. Copy its Internal Database URL for the web service; keep it secret. Put both services in the same region.

### B. Web service
New > Web Service > connect your GitHub repository. Runtime Node, repository root (Root Directory blank), branch main. Use supported Node LTS compatible with Vite.

Build command:
```sh
npm ci --include=dev && npm run build && npm run db:setup
```
Start command:
```sh
npm start
```
Health check: /api/health

Environment:
```dotenv
NODE_ENV=production
DATABASE_URL=YOUR_RENDER_INTERNAL_DATABASE_URL
APP_ORIGIN=https://YOUR-ACTUAL-SERVICE.onrender.com
DB_SSL=false
```
Internal private-network database URL is the illustrated configuration; follow the host's connection/TLS instructions if they differ. For an external database that requires TLS, set DB_SSL=true: certificate verification stays enabled, so the CA must be trusted. Do not blindly disable certificate verification. Prefer private networking for database traffic. Render supplies PORT; the app binds to it on 0.0.0.0.

Deploy. Once assigned the actual URL, correct APP_ORIGIN and redeploy if needed. With this same-origin layout browser calls use relative /api paths, not localhost. CORS is not authentication; board-key checks enforce access. No secrets are bundled into the frontend. Schema setup in build is sufficient for this initial assignment; use proper controlled migrations for later schema changes.

### C. Live verification
1. Visit your actual HTTPS URL and /api/health.
2. Create a NEW live board (local database records are not transferred).
3. Save its key, create/edit a project, refresh and verify persistence.
4. Test mobile width, keyboard navigation, theme and errors.
5. Import production.postman_environment.json in Postman.
6. Replace its placeholder baseUrl with your real HTTPS URL, no trailing slash.
7. Select that environment and run all tests.

Live CLI:
```sh
npx newman run postman/OrbitDesk.postman_collection.json --env-var baseUrl=https://YOUR-ACTUAL-SERVICE.onrender.com
```
Save screenshots/results only after all checks succeed. They must not reveal keys or database credentials.

## API reference
POST /api/boards -> 201 {id,token}; no authentication, rate-limited.
GET /api/health -> 200 when DB connected; 503 otherwise.
All /api/projects routes require X-Board-Token header.
GET /api/projects -> board's projects only.
POST /api/projects -> validated create, 201.
PUT /api/projects/:id -> complete replacement of editable fields, 200.
DELETE /api/projects/:id -> 204.
Invalid input 400; invalid key 401; missing project 404; unexpected error 500.

Project JSON:
```json
{"title":"Launch portfolio","description":"Build and ship","category":"Development","status":"active","priority":"high","progress":40,"due_date":"2026-12-01"}
```
Categories: Design, Development, Learning, Personal. Statuses: planned, active, completed. Priorities: low, medium, high. progress is integer 0-100; completed forces 100. due_date is a valid YYYY-MM-DD date or null. SQL is parameterized and records are scoped by board ID. Client renders text with HTML escaping.

## Troubleshooting
- ECONNREFUSED: start PostgreSQL and confirm host/port.
- Password authentication failed: check credentials and URL encoding.
- relation does not exist: run npm run db:setup against the correct database.
- Frontend cannot reach API: verify backend health, proxy port and browser Network tab.
- Blank production page / missing index.html: run npm run build and check deployment logs.
- EADDRINUSE: stop the older server or update PORT and Vite proxy together.
- 401: restore the correct board key; localhost and hosted databases are separate.
- 429: wait for rate-limit window; avoid repeated board creation.
- 3D unavailable: WebGL may be unsupported/disabled; static fallback is intentional.
- No animation: reduced-motion preference intentionally disables animation.
- TLS errors: use provider's correct URL/CA settings, not insecure certificate bypasses.
- CORS mismatch: exact APP_ORIGIN includes scheme and port, no path/trailing slash.
- Missing Node/npm: reopen terminal after installation and verify PATH.

## Security and production limits
Board keys in localStorage can be exposed by browser compromise or XSS. The app mitigates risk with CSP, HTML escaping and no third-party CDN scripts, but this is not a substitute for audited account authentication. For broader public use add user accounts with secure HttpOnly sessions, key rotation/recovery, board lifecycle cleanup, robust migrations, backups, pagination and monitoring. In-memory rate limits reset on restart and are per instance. Single-proxy trust assumes the illustrated Render deployment; adapt to other hosts. Reduced motion, responsive layout, labelled controls and dialogs are implemented; a full accessibility audit has not been performed.

## Submission checklist
- [ ] GitHub source repository accessible to evaluator.
- [ ] Live HTTPS website URL recorded below.
- [ ] Working pages and API with hosted database.
- [ ] Real secrets excluded from Git.
- [ ] Browser CRUD persists after refresh.
- [ ] All live Postman assertions passed; evidence captured safely.
- [ ] Friendly loading/empty/error states checked.
- [ ] 3D animation and reduced-motion fallback checked.
- [ ] Fresh clone: npm ci, configure .env, initialize schema, run and build successfully.

Live URL: NOT DEPLOYED YET
GitHub URL: ADD AFTER PUSH
Smoke test date/result: ADD AFTER ACTUAL RUN

## Documentation sources used for setup guidance
Render: https://render.com/docs/multi-service-architecture
Postman scripts: https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts
Postman variable scopes: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/
