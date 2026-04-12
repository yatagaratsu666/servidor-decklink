# ---------- BUILD ----------
FROM node:20 AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build (usa tu script)
RUN npm run build


# ---------- PROD ----------
FROM node:20

WORKDIR /app

# Solo dependencias necesarias
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar build desde builder
COPY --from=builder /app/build ./build

# Puerto
EXPOSE 3000

# Ejecutar
CMD ["npm", "start"]