FROM ppio-harbor-registry.tencentcloudcr.com/ai-cloud-platform/ppinfra-home-nodejs-builder:node18.20-alpine3.19 AS base

ARG NOVITA_VERSION 
ARG STATIC_COS_BUCKET
ARG STATIC_COS_REGION
ARG STATIC_COS_SECRET_ID
ARG STATIC_COS_SECRET_KEY
ARG STRAPI_API_TOKEN
ARG USE_CDN
ARG NPM_RUNNER

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* pnpm-lock.yaml* ./

RUN \
    if [ -z "$NOVITA_VERSION" ] || [ -z "$STATIC_COS_BUCKET" ] || [ -z "$STATIC_COS_REGION" ] || [ -z "$STATIC_COS_SECRET_ID" ] || [ -z "$STATIC_COS_SECRET_KEY" ] || [ -z "$NPM_RUNNER" ]; then \
        echo "NOVITA_VERSION, STATIC_COS_BUCKET, STATIC_COS_REGION, STATIC_COS_SECRET_ID, STATIC_COS_SECRET_KEY, NPM_RUNNER must be set." && exit 1; \
    fi && \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.cloud.tencent.com/g' /etc/apk/repositories && \
    npm config set registry https://mirrors.cloud.tencent.com/npm/ && \
    npm config get registry && \
    if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN echo "DEBUG ARGS: ${NOVITA_VERSION}, ${STATIC_COS_BUCKET}, $STATIC_COS_REGION, $USE_CDN, $NPM_RUNNER" && \
    npm run $NPM_RUNNER


ENV Bucket=$STATIC_COS_BUCKET \
Region=$STATIC_COS_REGION \
SecretId=$STATIC_COS_SECRET_ID \
SecretKey=$STATIC_COS_SECRET_KEY \
STRAPI_API_TOKEN=$STRAPI_API_TOKEN \
NOVITA_VERSION=$NOVITA_VERSION \
USE_CDN=$USE_CDN


# Check is set USE_CDN
RUN echo "DEBUG USE_CDN: $USE_CDN" && \
    if [ ! -z "$USE_CDN" ]; then \
        node ./scripts/upload-cos/index.js $NOVITA_VERSION || exit 1; \
    fi

# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV dev
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOST 0.0.0.0
ENV HOSTNAME 0.0.0.0

CMD ["node", "server.js"]
