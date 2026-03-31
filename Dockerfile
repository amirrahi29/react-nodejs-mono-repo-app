FROM node:22-alpine AS web-build
WORKDIR /app
ARG GIT_SHA=unknown
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm ci
COPY apps/web ./apps/web
RUN npm run build -w @repo/web

FROM node:22-alpine AS runner
WORKDIR /app
ARG GIT_SHA=unknown
ENV NODE_ENV=production
ENV PORT=8080
ENV APP_BUILD_VERSION=${GIT_SHA}
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev
COPY apps/api ./apps/api
COPY --from=web-build /app/apps/web/build ./apps/web/build
RUN chown -R node:node /app
USER node
WORKDIR /app/apps/api
EXPOSE 8080
CMD ["node", "src/index.js"]
