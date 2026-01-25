# Настройка GitHub Secrets для CI/CD

Для работы CI/CD pipeline необходимо добавить следующие secrets в GitHub:

## Где добавить Secrets

1. Перейдите в репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Добавьте каждый secret по очереди

## Обязательные Secrets

### Django настройки

- `DJANGO_SECRET_KEY` - Секретный ключ Django (сгенерируйте через `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `DEBUG` - Режим отладки (`False` для production)
- `ALLOWED_HOSTS` - Разрешенные хосты (например: `example.com,www.example.com`)
- `CORS_ALLOWED_ORIGINS` - Разрешенные источники для CORS (например: `https://example.com,https://www.example.com`)
- `CORS_ALLOW_ALL_ORIGINS` - Разрешить все источники (`False` для production)
- `CSRF_TRUSTED_ORIGINS` - Доверенные источники для CSRF (например: `https://example.com`)

### База данных

- `DATABASE_URL` - URL базы данных PostgreSQL (например: `postgresql://user:password@db:5432/dbname`)

### PostgreSQL (для .env.postgres)

- `POSTGRES_DB` - Имя базы данных
- `POSTGRES_USER` - Пользователь PostgreSQL
- `POSTGRES_PASSWORD` - Пароль PostgreSQL
- `TZ` - Часовой пояс (например: `UTC` или `Europe/Moscow`)
- `PGTZ` - Часовой пояс PostgreSQL (обычно такой же как `TZ`)

### Суперпользователь Django

- `DJANGO_SUPERUSER_USERNAME` - Имя пользователя администратора
- `DJANGO_SUPERUSER_PASSWORD` - Пароль администратора
- `DJANGO_SUPERUSER_EMAIL` - Email администратора

### JWT токены

- `ACCESS_TOKEN_LIFETIME_MINUTES` - Время жизни access токена в минутах (по умолчанию: `15`)
- `REFRESH_TOKEN_LIFETIME_DAYS` - Время жизни refresh токена в днях (по умолчанию: `7`)
- `PASSWORD_RESET_TOKEN_LIFETIME_HOURS` - Время жизни токена сброса пароля в часах (по умолчанию: `24`)

### Email настройки

- `EMAIL_BACKEND` - Бэкенд для отправки email (по умолчанию: `django.core.mail.backends.smtp.EmailBackend`)
- `EMAIL_HOST` - SMTP сервер (например: `smtp.gmail.com`)
- `EMAIL_PORT` - Порт SMTP (по умолчанию: `587`)
- `EMAIL_USE_TLS` - Использовать TLS (по умолчанию: `True`)
- `EMAIL_HOST_USER` - Пользователь SMTP
- `EMAIL_HOST_PASSWORD` - Пароль SMTP
- `DEFAULT_FROM_EMAIL` - Email отправителя по умолчанию

### Frontend

- `FRONTEND_URL` - URL фронтенда (например: `https://example.com`)

### Опциональные

- `COMPOSE_BAKE` - Использовать docker buildx bake (по умолчанию: `true`)

## VPS Deploy Secrets

Для деплоя на VPS также нужны:

- `VPS_HOST` - IP адрес или домен VPS
- `VPS_USERNAME` - Имя пользователя для SSH
- `VPS_SSH_KEY` - Приватный SSH ключ для доступа к VPS
- `VPS_PORT` - SSH порт (обычно `22`)
- `VPS_DEPLOY_PATH` - Путь на VPS, куда деплоить (например: `/var/www/aregrp`)
- `PRODUCTION_URL` - URL production окружения (например: `https://example.com`)

## Проверка

После добавления всех secrets, workflow должен успешно создавать файлы `.env` и `.env.postgres` при деплое.

## Безопасность

⚠️ **Важно**: Никогда не коммитьте реальные значения secrets в репозиторий. Используйте только GitHub Secrets для хранения конфиденциальной информации.
