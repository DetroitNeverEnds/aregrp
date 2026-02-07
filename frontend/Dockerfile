# Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Принимаем build argument для Yandex Maps API ключа
ARG VITE_YANDEX_MAPS_API_KEY
ENV VITE_YANDEX_MAPS_API_KEY=$VITE_YANDEX_MAPS_API_KEY

# Собираем приложение для production
RUN npm run build

# Production образ - nginx с оптимизированной конфигурацией
FROM nginx:alpine

# Метаданные образа
LABEL maintainer="aregrp"
LABEL description="Frontend application for aregrp project"

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Создаём директории для логов с правильными правами
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /var/log/nginx

# Health check для проверки работоспособности
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Открываем порт 80
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]