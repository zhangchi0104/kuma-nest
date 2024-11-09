FROM node:lts-slim as builder
WORKDIR /app/
# Copy srcfiles
COPY . .
RUN apt-get update -y && apt-get install -y openssl
# Install pnpm
RUN npm i -g pnpm

#  Install dependencies
RUN pnpm i

RUN pnpx prisma generate
RUN pnpm build:local

RUN mv dist/client/libquery_engine-*.node dist/ &&\
  rm -r dist/client

FROM node:lts-slim
RUN apt-get update -y && apt-get install -y openssl curl
# RUN
WORKDIR /app
EXPOSE 8000
COPY --from=builder /app/dist .
# CMD
CMD ["node", "index.js"]
