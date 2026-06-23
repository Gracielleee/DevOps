FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

ARG BACKEND_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_URL=/api/
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next ./.next/
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

USER nextjs
EXPOSE 3001
CMD ["npm", "start"]