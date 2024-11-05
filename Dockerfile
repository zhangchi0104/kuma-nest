FROM public.ecr.aws/amazonlinux/amazonlinux:latest

WORKDIR /app/
# Copy srcfiles

RUN yum update -y && \
 yum install -y  nodejs npm
COPY . .
# Install pnpm
RUN npm i -g pnpm

#  Install dependencies
RUN pnpm i

RUN pnpx prisma generate

# RUN
RUN pnpm nest build


# CMD
CMD ["node", "dist/main.js"]
