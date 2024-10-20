FROM public.ecr.aws/lambda/nodejs:20


WORKDIR /app/
# Copy srcfiles

COPY . .
# Install pnpm
RUN npm i -g pnpm

#  Install dependencies
RUN pnpm i

# RUN
RUN pnpm nest build

# CMD
CMD ["node", "dist./main-serverless.js"]
