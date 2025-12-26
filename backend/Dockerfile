# ---------- build stage ----------
FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build    # ← dist をここで作る

# ---------- runtime stage ----------
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./

RUN npm install --production

EXPOSE 8080
CMD ["node", "dist/server.js"]
