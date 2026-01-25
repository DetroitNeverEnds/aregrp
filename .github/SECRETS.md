# Настройка GitHub Secrets для CI/CD

Для работы CI/CD pipeline необходимо добавить secrets в GitHub.

## Где добавить Secrets

1. Перейдите в репозиторий на GitHub
2. **Settings → Secrets and variables → Actions**
3. Нажмите **"New repository secret"**
4. Добавьте секреты

## Рекомендуемый подход: .env файлы как секреты

Вместо создания множества отдельных секретов, храните весь `.env` файл как один секрет. Это проще и удобнее.

### Шаг 1: Подготовка файлов локально

```bash
# Создайте файл backend/.env.prod с реальными значениями
cd backend
cat .env > .env.prod
# Отредактируйте .env.prod, заменив все <placeholder> на реальные значения

# Создайте файл backend/.env.postgres.prod
cat .env.postgres > .env.postgres.prod
# Отредактируйте .env.postgres.prod
```

### Шаг 2: Добавление в GitHub Secrets

1. Откройте файл `backend/.env.prod`
2. Скопируйте **весь** его содержимое
3. В GitHub: **Settings → Secrets and variables → Actions → New secret**
   - **Name**: `ENV_FILE`
   - **Value**: Вставьте весь содержимое файла `.env.prod`
4. Повторите для PostgreSQL:
   - **Name**: `ENV_POSTGRES_FILE`
   - **Value**: Вставьте весь содержимое файла `.env.postgres.prod`

### Шаг 3: Версионирование (опционально)

Можно хранить примеры файлов в репозитории (без реальных значений):

```bash
# Добавьте в .gitignore
backend/.env.prod
backend/.env.postgres.prod

# Но оставьте примеры
backend/.env.prod.example
backend/.env.postgres.prod.example
```

## Необходимые Secrets

### Обязательные

- **`ENV_FILE`** - Весь содержимое файла `backend/.env` с реальными значениями
- **`ENV_POSTGRES_FILE`** - Весь содержимое файла `backend/.env.postgres` с реальными значениями

### VPS Deploy Secrets

- **`VPS_HOST`** - IP адрес или домен VPS
- **`VPS_USERNAME`** - Имя пользователя для SSH
- **`VPS_SSH_KEY`** - Приватный SSH ключ для доступа к VPS
- **`VPS_PORT`** - SSH порт (обычно `22`)
- **`VPS_DEPLOY_PATH`** - Путь на VPS, куда деплоить (например: `/var/www/aregrp`)
- **`PRODUCTION_URL`** - URL production окружения (например: `https://example.com`)

## Структура .env файлов

### backend/.env

```bash
COMPOSE_BAKE=true
DEBUG=False
ALLOWED_HOSTS=example.com,www.example.com
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
CORS_ALLOW_ALL_ORIGINS=False
CSRF_TRUSTED_ORIGINS=https://example.com
DATABASE_URL=postgresql://user:password@db:5432/dbname
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=secure_password
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7
PASSWORD_RESET_TOKEN_LIFETIME_HOURS=24
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com
FRONTEND_URL=https://example.com
```

### backend/.env.postgres

```bash
TZ=UTC
PGTZ=UTC
POSTGRES_DB=dbname
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```

## Преимущества этого подхода

✅ **Один секрет** вместо множества  
✅ **Удобно** - легко обновлять  
✅ **Поддерживаемо** - можно версионировать локально  
✅ **Безопасно** - секреты не попадают в репозиторий  

## Обновление секретов

Если нужно обновить значения:

1. Отредактируйте локальный файл `.env.prod`
2. Скопируйте новое содержимое
3. В GitHub: **Settings → Secrets → Actions → ENV_FILE → Update**
4. Вставьте новое содержимое и сохраните

## Безопасность

⚠️ **Важно**: 
- Никогда не коммитьте реальные `.env.prod` файлы в репозиторий
- Добавьте их в `.gitignore`
- Используйте только GitHub Secrets для хранения конфиденциальной информации
