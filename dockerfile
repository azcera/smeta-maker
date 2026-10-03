# Этап 1: Сборка всего приложения
FROM node:18-alpine AS builder
WORKDIR /app

# Копируем корневой package.json
COPY package*.json ./
RUN npm install

# Копируем папки backend и frontend вместе с их package.json
COPY backend ./backend
COPY frontend ./frontend

# Запускаем установку зависимостей во вложенных папках и сборку всего проекта
RUN npm run setup
RUN npm run build:all

# Этап 2: Финальный легковесный контейнер для запуска
FROM node:18-alpine
WORKDIR /app

# Переносим только собранный код бэкенда и фронтенда из предыдущего этапа
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist 

# Пробрасываем порт и принудительно выставляем production окружение
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

# Запускаем только скомпилированный бэкенд
CMD ["node", "backend/dist/index.js"]