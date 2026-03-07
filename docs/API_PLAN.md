**Общий формат:**

Формат ошибок:

```json
{ 
    "type": "https://api.example.com/problems/order-already-paid",
    "status": 409,
    "title": "Order cannot be modified",
    "detail": "Order 123 is already paid and cannot be edited.",
    "instance": "/api/v1/orders/123",
    "code": "ORDER_ALREADY_PAID"
}
```

type - некоторый тип ошибки

status - копия http статуса

title - заголовок (краткое описание)

detail - детали ошибки

instance - uri ресурса, на котором случилась ошибка

code - внутренний код ошибки

На фронте мы используем code для того, чтобы выбирать, какую текстовку показать. title и detail - фолбэки, если код не нашли

### Функциональные требования к API:

- список зданий для селекта
- каталог зданий для главной страницы (+ подгрузка «Показать ещё»)
- каталог офисов на главную (+ подгрузка «Показать ещё»)
- фидбек форма (главная)
- Каталог офисов для поиска (+ пагинация)
- фидбек форма (каталог)
- Информация пользователя (get+update)
    - общая информация
    - объекты (+ пагинация)
    - бронь (+ пагинация)
- Ссылки на кейсы (пока что статичны)
- Информация про здание (общая инфа, этажи, инфра, медиа) (страница объекта)
- Этаж здания (офисы, схема)
- генерация ссылки для офиса
- фидбэк (агентам)

### «Показать ещё» (шорт-лист)

Здания: page, page_size=6, extended (удлинённый список)

Помещения: page, page_size=6 (уже есть)

### Список API (Примерный)

```yaml
Auth:
- вход по email/пароль /api/v1/auth/login
- регистрация /api/v1/auth/register
- выход /api/v1/auth/logout
- обновление токенов /api/v1/auth/refresh-token
- сброс пароля:
    - запрос на сброс /api/v1/auth/password-reset
    - подтверждение /api/v1/auth/password-reset/confirm

Contacts / Site Settings:
- основные настройки /api/v1/site-settings/main-info
- контакты (ОГРН, адрес) /api/v1/site-settings/contacts
- обратная связь /api/v1/feedback?origin

Buildings:
- short-list (селект) /api/v1/premises/buildings
- список /api/v1/buildings/
- инфо о здании /api/v1/buildings/<uuid>
- Floor info /api/v1/buildings/info/<uuid>/floor/<number> (TODO)

Premises:
- catalogue /api/v1/premises (sale_type в query: rent|sale)
- деталь /api/v1/premises/<uuid>
- referal-link /api/v1/premises/link?uuid

Cases:
- strategies /api/v1/cases/<cat>
- all-cases /api/v1/cases/all

User:
- info /api/v1/profile/user
- update /api/v1/profile/profile
- objects /api/v1/profile/objects
- bookings /api/v1/profile/bookings

---

/api/v1/buildings/ (список) и /api/v1/buildings/<uuid> (инфо):
- uuid (string)
- title (string)
- address (string)
- description (string)
- min_sale_price? (number)
- min_rent_price? (number)
- media (MedialList)

MedialList:
	type: 'photo'|'video'
	link: string

/api/v1/premises/buildings (селект):
- uuid (string)
- name (string)
- address (string)

/api/v1/premises (каталог):
items: uuid, name, price, address, floor?, area, has_tenant, media
total, page, page_size

/api/v1/premises/<uuid> (деталь):
+ description?, price_per_sqm?, ceiling_height?
  has_windows, has_parking, is_furnished
```

# Готовность (Бэк)

**Auth:**

- [x]  /api/v1/auth/login
- [x]  /api/v1/auth/register
- [x]  /api/v1/auth/logout
- [x]  /api/v1/auth/refresh-token
- [ ]  /api/v1/auth/password-reset
- [ ]  /api/v1/auth/password-reset/confirm

**Contacts / Site Settings:**

- [x]  /api/v1/site-settings/main-info
- [x]  /api/v1/site-settings/contacts
- [ ]  /api/v1/feedback

**Buildings:**

- [x]  /api/v1/premises/buildings
- [x]  /api/v1/buildings/
- [x]  /api/v1/buildings/<uuid>
- [ ]  /api/v1/buildings/info/<uuid>/floor/<number>

**Premises:**

- [x]  /api/v1/premises
- [x]  /api/v1/premises/<uuid>
- [ ]  /api/v1/premises/link?uuid

**User:**

- [x]  /api/v1/profile/user
- [x]  /api/v1/profile/profile
- [ ]  /api/v1/profile/objects
- [ ]  /api/v1/profile/bookings

**Cases:**

- [ ]  /api/v1/cases/<cat>
- [ ]  /api/v1/cases/all
