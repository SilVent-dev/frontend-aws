# ===================== Stage 1: Build =====================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --frozen-lockfile --silent

# Copia código e builda para produção
COPY . .
RUN npm run build

# ===================== Stage 2: Nginx =====================
FROM nginx:1.25-alpine

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copia build do Vue
COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
