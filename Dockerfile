# Dockerfile para backend
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la aplicación TypeScript
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias e información del proyecto
COPY --from=build /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar archivos compilados
COPY --from=build /app/dist ./dist

# Crear directorio para uploads
RUN mkdir -p ./dist/uploads && chmod 777 ./dist/uploads

# Exponer puerto
EXPOSE 3800

# Comando para iniciar la aplicación
CMD ["node", "dist/app.js"]