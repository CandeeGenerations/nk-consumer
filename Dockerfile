FROM node:20-alpine AS base

# DEPENDENCIES
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json ./
RUN pnpm install --ignore-scripts

# BUILDER
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY . .

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN pnpm build

# RUNNER
FROM node:20-slim AS runner

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update && apt-get install gnupg wget -y
RUN wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install google-chrome-stable -y --no-install-recommends
RUN rm -rf /var/lib/apt/lists/*

RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser
RUN mkdir -p /home/pptruser/Downloads
RUN chown -R pptruser:pptruser /home/pptruser

USER pptruser

RUN npx puppeteer browsers install chrome

COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/dist dist
COPY --from=builder /app/templates/build_production dist/templates/build_production

WORKDIR /dist

CMD [ "node", "index.js" ]

EXPOSE 7703
