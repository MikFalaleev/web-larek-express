# Бэкенд Web-ларёк

REST API интернет-магазина Web-ларёк: каталог товаров, оформление заказа, авторизация
администратора (JWT + refresh-токен) и управление товарами с загрузкой изображений.

## Используемые технологии и решения

- TypeScript — основной язык проекта
- Node.js + Express — сервер и маршрутизация
- MongoDB и Mongoose — хранение товаров и пользователей
- celebrate + Joi — валидация запросов
- jsonwebtoken, bcryptjs — access/refresh-токены и хеширование паролей
- multer — загрузка файлов, cron — периодическая очистка временной папки
- winston + express-winston — логирование запросов и ошибок (`request.log`, `error.log`)
- ESLint (Airbnb) — линтинг кода

## Запуск

Нужны Node.js и запущенная MongoDB.

```bash
npm install
cp .env.example .env
npm run dev
```

Сервер стартует на `http://localhost:3000`. Другие команды:

- `npm run build` — сборка TypeScript в `dist`
- `npm start` — запуск без автоперезапуска
- `npm run lint` — проверка кода линтером

MongoDB можно поднять в Docker:

```bash
docker run -d --name mongo -p 27017:27017 mongo
```

## Переменные окружения (`.env`)

| Переменная | Значение по умолчанию | Описание |
|---|---|---|
| `PORT` | `3000` | порт сервера |
| `DB_ADDRESS` | `mongodb://127.0.0.1:27017/weblarek` | адрес MongoDB |
| `ORIGIN_ALLOW` | `http://localhost:5173` | разрешённый источник для CORS (адрес фронтенда) |
| `UPLOAD_PATH` | `images` | папка постоянного хранения картинок в `src/public` |
| `UPLOAD_PATH_TEMP` | `temp` | временная папка загрузок в `backend` |
| `AUTH_ACCESS_TOKEN_EXPIRY` | `10m` | время жизни access-токена |
| `AUTH_REFRESH_TOKEN_EXPIRY` | `7d` | время жизни refresh-токена |
| `AUTH_ACCESS_TOKEN_SECRET` | — | секрет подписи access-токена |
| `AUTH_REFRESH_TOKEN_SECRET` | — | секрет подписи refresh-токена |

## Маршруты

Защищённые маршруты требуют заголовок `Authorization: Bearer <accessToken>`.
Без него (или с недействительным токеном) возвращается `401`.

| Метод | Путь | Доступ | Описание | Успех | Ошибки |
|---|---|---|---|---|---|
| GET | `/product` | открыт | список товаров | 200 `{ items, total }` | 500 |
| POST | `/product` | токен | создание товара | 201 товар | 400, 401, 409, 500 |
| PATCH | `/product/:productId` | токен | обновление товара | 200 товар | 400, 401, 404, 409, 500 |
| DELETE | `/product/:productId` | токен | удаление товара и его картинки | 200 удалённый товар | 400, 401, 404, 500 |
| POST | `/order` | открыт | оформление заказа | 200 `{ id, total }` | 400, 500 |
| POST | `/upload` | токен | загрузка картинки во временную папку (поле `file`) | 200 `{ fileName, originalName }` | 400, 401, 500 |
| POST | `/auth/register` | открыт | регистрация | 201 `{ user, success, accessToken }` | 400, 409, 500 |
| POST | `/auth/login` | открыт | вход | 200 `{ user, success, accessToken }` | 400, 401, 500 |
| GET | `/auth/token` | refresh-cookie | обновление пары токенов | 200 `{ user, success, accessToken }` | 401, 404, 500 |
| GET | `/auth/logout` | refresh-cookie | выход, удаление refresh-токена | 200 `{ success }` | 401, 404, 500 |
| GET | `/auth/user` | токен | текущий пользователь | 200 `{ user, success }` | 401, 404, 500 |

Refresh-токен хранится в httpOnly-cookie и обновляется при каждом `/auth/token`
(старый токен перестаёт действовать).

### Формат ошибок

- Ошибки валидации запроса (celebrate, включая невалидный `productId`):
  `{ statusCode, error, message: "Validation failed", validation }`
- Остальные ошибки: `{ "message": "..." }`, например:
  - `400` — `Недопустимый тип файла. Разрешены png, jpg, gif и svg`
  - `401` — `Необходима авторизация`
  - `404` — `Нет товара по заданному id`, `Маршрут не найден`
  - `409` — `Товар с таким заголовком уже существует`, `Пользователь с таким email уже существует`
  - `500` — `На сервере произошла ошибка`

## Загрузка изображений

1. `POST /upload` сохраняет файл (png, jpg, gif, svg, до 10 МБ) в `backend/temp` под уникальным именем.
2. При создании или обновлении товара файл переносится из `temp` в `src/public/images`.
3. Файлы в `temp` старше часа удаляются автоматически (cron, раз в час).
4. При удалении товара его картинка удаляется, если ею не пользуется другой товар.
