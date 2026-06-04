# To-Do App

Fullstack-приложение для управления задачами (To-Do App) с прогнозированием времени выполнения на основе машинного обучения.

## Описание проекта

Приложение позволяет пользователям создавать, редактировать и удалять задачи, сортировать их по категориям или статусу, а также получать прогноз времени выполнения на основе истории.

**Стек:** FastAPI (бэкенд) + React / TypeScript (фронтенд) + PostgreSQL + Docker + Nginx.

## Функционал

### Основные функции
- **Авторизация и аутентификация** — регистрация, вход, обновление токена, смена пароля
- **Управление задачами** — создание, просмотр, редактирование, удаление задач
- **Категории** — создание категорий для группировки задач
- **Статусы задач** — `pending` (в ожидании) / `completed` (выполнена)
- **Фильтрация** — по статусу, категории, приоритету
- **Сортировка** — по дате создания, приоритету, сроку выполнения
- **Пагинация** — постраничный вывод списка задач

### ИИ-функции
- **Прогнозирование времени выполнения** на основе:
  - Категории задачи
  - Приоритета
  - Длины описания
  - Истории выполненных задач пользователя

При недостаточном количестве данных (< 5 выполненных задач) используется fallback на среднее значение.

## Технологический стек

| Технология | Назначение |
|------------|------------|
| Python 3.11 | Основной язык программирования |
| FastAPI | Асинхронный веб-фреймворк |
| Pydantic | Валидация данных и сериализация |
| SQLAlchemy 2.0 (async) | ORM для работы с PostgreSQL |
| PostgreSQL | Реляционная база данных |
| Alembic | Управление миграциями БД |
| Pytest | Фреймворк для тестирования |
| scikit-learn | Машинное обучение (Random Forest) |
| Docker & Docker Compose | Контейнеризация и оркестрация |
| Uvicorn | ASGI-сервер |
| React 19 | Библиотека UI |
| TypeScript | Типизация фронтенда |
| Vite | Сборка фронтенда |
| React Router | Маршрутизация |
| Nginx | Раздача статики и проксирование |

## Быстрый старт

### Требования
- Docker
- Docker Compose

### Запуск проекта

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd todo_app

# 2. Запустить сервисы
docker-compose up -d

# 3. Применить миграции (при первом запуске)
docker-compose exec app alembic upgrade head
```

**Фронтенд:** http://localhost

**API (Swagger UI):** http://localhost/api/docs

**API Health:** http://localhost/health

### Остановка

```bash
docker-compose down
```

Для полной очистки данных (включая volumes):
```bash
docker-compose down -v
```

## API Endpoints

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/register` | Регистрация нового пользователя |
| POST | `/api/v1/auth/login` | Аутентификация (OAuth2 Password) |
| POST | `/api/v1/auth/refresh` | Обновление access-токена |
| POST | `/api/v1/auth/change-password` | Смена пароля |

### Задачи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/tasks/` | Создать задачу |
| GET | `/api/v1/tasks/` | Получить список задач (с фильтрами) |
| GET | `/api/v1/tasks/{id}` | Получить задачу по ID |
| PUT | `/api/v1/tasks/{id}` | Обновить задачу |
| DELETE | `/api/v1/tasks/{id}` | Удалить задачу |
| PATCH | `/api/v1/tasks/{id}/complete` | Отметить задачу выполненной |
| GET | `/api/v1/tasks/predict/{id}` | Прогноз времени выполнения |

### Категории

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/tasks/categories` | Создать категорию |
| GET | `/api/v1/tasks/categories` | Получить список категорий |

### Системные

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Проверка работоспособности |

## Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Иван",
    "last_name": "Иванов",
    "login": "ivanov",
    "password": "password123"
  }'
```

### Авторизация

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=ivanov&password=password123"
```

Ответ:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Создание задачи

```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "title": "Купить продукты",
    "description": "Молоко, хлеб, яйца",
    "priority": 2
  }'
```

### Фильтрация задач

```bash
# Только невыполненные задачи с приоритетом 2
curl "http://localhost:8000/api/v1/tasks/?status=pending&priority=2&page=1&page_size=10" \
  -H "Authorization: Bearer <access_token>"
```

### Выполнение задачи

```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/{task_id}/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"actual_duration": 45}'
```

### Прогноз времени

```bash
curl http://localhost:8000/api/v1/tasks/predict/{task_id} \
  -H "Authorization: Bearer <access_token>"
```



## Тестирование

### Запуск тестов

```bash
# Запуск тестов внутри контейнера
docker-compose exec app pytest tests/ -v
```

### Покрытие тестами

Проект покрыт тестами на 11 тест-кейсов:

- Регистрация пользователя
- Проверка дубликата логина
- Валидация слабого пароля
- Авторизация
- Неверные учетные данные
- Создание задачи
- Получение списка задач
- Выполнение задачи
- Удаление задачи
- Валидация невалидных данных
- Неавторизованный доступ

```bash
# Запуск с отчетом о покрытии
docker-compose exec app pytest tests/ --cov=app --cov-report=html
```

### Фронтенд (React Testing Library + Vitest)

```bash
cd frontend
npm test
```

Тесты покрывают:
- Авторизацию (логин, логаут, состояние)
- Валидацию форм (регистрация, создание задачи)
- Бизнес-логику (фильтрация, приоритеты)
- Граничные условия (пустые поля, несовпадение паролей)

## Модель данных

### Таблицы

**users** — пользователи
- `id` (UUID, PK)
- `first_name` (string)
- `last_name` (string)
- `login` (string, unique)
- `password_hash` (string)
- `created_at` (datetime)

**categories** — категории задач
- `id` (integer, PK, auto)
- `name` (string)
- `user_id` (UUID, FK → users)

**tasks** — задачи
- `id` (UUID, PK)
- `title` (string)
- `description` (text, nullable)
- `category_id` (integer, FK → categories, nullable)
- `user_id` (UUID, FK → users)
- `status` (enum: pending/completed)
- `priority` (integer, default 1)
- `due_date` (datetime, nullable)
- `actual_duration` (integer, nullable) — фактическое время в минутах
- `created_at` (datetime)

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | — |
| `SECRET_KEY` | Секретный ключ для JWT | — |
| `ALGORITHM` | Алгоритм JWT | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни access-токена (мин) | 15 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Время жизни refresh-токена (дни) | 7 |

## Структура проекта

```
todo_app/
├── alembic/                  # Миграции базы данных
│   ├── env.py
│   └── versions/
│       └── 001_create_tables.py
├── app/                      # Основной код приложения
│   ├── api/                  # Роутеры API
│   │   ├── auth.py
│   │   └── tasks.py
│   ├── services/             # Бизнес-логика
│   │   ├── auth_service.py
│   │   ├── task_service.py
│   │   └── prediction_service.py
│   ├── models/               # Модели SQLAlchemy
│   │   └── __init__.py
│   ├── repositories.py       # Репозитории (доступ к БД)
│   ├── schemas.py            # Pydantic-схемы
│   ├── dependencies.py       # Зависимости FastAPI
│   ├── database.py           # Настройка БД
│   ├── config.py             # Конфигурация
│   └── main.py               # Точка входа
├── frontend/                 # Фронтенд React
│   ├── src/
│   │   ├── components/       # UI-компоненты
│   │   ├── context/          # React Context
│   │   ├── pages/            # Страницы
│   │   ├── test/             # Тесты
│   │   ├── api.ts            # API клиент
│   │   ├── types.ts          # TypeScript типы
│   │   └── App.tsx           # Корневой компонент
│   ├── Dockerfile            # Docker образ фронтенда
│   ├── nginx.conf            # Конфиг Nginx
│   └── package.json          # Зависимости
├── scripts/                  # Утилиты
│   └── demo_predictions.py
├── tests/                    # Тесты бэкенда
│   └── test_api.py
├── docker-compose.yml        # Docker Compose конфиг
├── Dockerfile                # Docker образ бэкенда
├── requirements.txt          # Python-зависимости
├── alembic.ini               # Настройки Alembic
└── README.md                 # Документация
```

## Автор

Итоговое домашнее задание по дисциплине «Разработка прототипов программных решений»
