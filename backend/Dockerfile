# Базовый образ Node.js
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json (когда они появятся)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production || echo "No package.json found"

# Копируем исходный код
COPY . .

# Открываем порт для API
EXPOSE 3000

# Запускаем приложение
CMD ["node", "index.js"]