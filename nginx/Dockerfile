FROM nginx:alpine

# Метаданные образа
LABEL maintainer="aregrp"
LABEL description="Nginx reverse proxy for aregrp project"

# Копирование основного конфигурационного файла
COPY nginx.conf /etc/nginx/nginx.conf

# Копирование дополнительных конфигураций
COPY conf.d/ /etc/nginx/conf.d/

# Копирование includes (location конфигурации)
COPY includes/ /etc/nginx/includes/

# Создание директорий для логов и кеша с правильными правами
RUN mkdir -p /var/log/nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx && \
    chmod -R 755 /var/log/nginx /var/cache/nginx

# Health check для проверки работоспособности
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Открываем порты
EXPOSE 80 443

# Запуск nginx (команда по умолчанию из базового образа)
CMD ["nginx", "-g", "daemon off;"]
