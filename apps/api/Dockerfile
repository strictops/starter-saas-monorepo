FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install

FROM deps AS builder
WORKDIR /repo
COPY . .
RUN pnpm --filter api build

FROM builder AS runner
WORKDIR /repo/apps/api
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/main"]
