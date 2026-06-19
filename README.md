# StrictOps SaaS Monorepo Starter

Next.js web and NestJS API starter provisioned by StrictOps from one GitHub
repo. It deploys both services to ECS Fargate and includes PostgreSQL wiring
for a small production-shaped sample.

## What's Included

- `apps/web` - Next.js App Router service on port 3000.
- `apps/api` - NestJS API service on port 3000 in deploys and port 3001 for
  local development.
- Root `pnpm` workspace with Turborepo build/dev scripts.
- Per-service Dockerfiles for GitHub Actions builds.
- Root Dockerfile for StrictOps' prebuilt template image.
- `strictops.yml` with `dev` and `prod` environments, PostgreSQL enabled, and
  `web -> api` service linking.
- API `/health` endpoint for load balancer checks.
- API `/status` endpoint that writes a sample row to PostgreSQL when
  `DATABASE_URL` is available.
- Web page that reads StrictOps deploy metadata and calls the API status
  endpoint through `API_URL`.

## Run Locally

Install dependencies from the repo root:

```bash
pnpm install
```

Start both services:

```bash
pnpm dev
```

Open <http://localhost:3000>. The web service calls the API at
`http://localhost:3001` by default.

Run one service at a time:

```bash
pnpm --filter web dev
pnpm --filter api dev
```

## Build

```bash
pnpm build
```

The root build runs each workspace build through Turborepo. StrictOps-generated
GitHub Actions build `apps/web/Dockerfile` and `apps/api/Dockerfile` separately
after the repo is created.

## Environment Variables

StrictOps injects these in deployed environments. Set them locally only when
you want to mirror deploy behavior.

| Variable | Used by | Notes |
| --- | --- | --- |
| `STRICTOPS_SERVICE_NAME` | web, api | Service name shown in metadata. |
| `STRICTOPS_ENV_NAME` | web, api | Environment name shown in metadata. |
| `STRICTOPS_PROJECT_NAME` | web, api | Project name shown in metadata. |
| `STRICTOPS_REGION` | web, api | AWS region shown in metadata. |
| `API_URL` | web | API base URL. Defaults to `http://localhost:3001`. |
| `DATABASE_URL` | api | PostgreSQL connection string injected when the database is enabled. |
| `STRICTOPS_HOME_URL` | web | Optional StrictOps home link override. |
| `STRICTOPS_APP_URL` | web | Optional StrictOps Console URL used for docs links. |

## Service Map

`strictops.yml` declares two services:

```yaml
services:
  web:
    type: web
    links: [api]
  api:
    type: api
```

The `links: [api]` entry lets StrictOps wire the web service to the API service
at deploy time. The web app reads the resulting API URL from `API_URL`.

## PostgreSQL Sample

The API uses `DATABASE_URL` when it is present. On `GET /status`, it creates a
`starter_events` table if needed, inserts a heartbeat row, and returns the row
count. The web page displays that API and database status.

For local development without a database, the API still starts and reports that
`DATABASE_URL` is not set.

## Where strictops.yml Takes Effect

Most fields in `strictops.yml` apply through the StrictOps Console when you
deploy, redeploy, or roll back. Pushes to the generated repo rebuild images and
update the running ECS services, but they do not re-read `strictops.yml`.

Plain code changes ship on push. Config changes such as services, env vars,
secrets, profiles, replicas, databases, queues, and cache settings require a
Console deploy.

## Next Steps

- Replace `apps/web/app/page.tsx` with your product UI.
- Add real API modules under `apps/api/src`.
- Add non-secret config under `strictops.yml` `env:`.
- Add secrets under `strictops.yml` `secrets:` and store the values in AWS
  Secrets Manager or Parameter Store.
- Keep the service names in `strictops.yml` aligned with the app folders and
  Dockerfiles.
