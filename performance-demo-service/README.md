# performance-demo-service

Демо backend-сервис для практики нагрузочного тестирования и подготовки к собеседованиям по Performance / Load Testing.

## Стек

- Node.js + Express
- PostgreSQL
- Redis
- Prometheus
- Grafana
- Docker Compose

---

## Что умеет сервис

### Основные эндпоинты

- `POST /auth/login`
- `GET /products`
- `GET /products/:id`
- `GET /cart`
- `POST /cart/add`
- `POST /orders/create`
- `GET /orders/:id`
- `GET /health`
- `GET /metrics`

### Вспомогательный mock-эндпоинт

- `POST /mock/payment/charge`

Он нужен для моделирования внешнего платёжного сервиса:
- нормальный ответ
- медленный ответ
- ошибка внешнего провайдера
- timeout

---

## Бизнес-flow для нагрузки

Базовый end-to-end сценарий:

1. Логин
2. Получение списка товаров
3. Получение карточки товара
4. Добавление товара в корзину
5. Просмотр корзины
6. Создание заказа
7. Получение созданного заказа

Это хороший сценарий для:
- baseline
- load
- stress
- capacity
- анализа bottleneck'ов

---

## Архитектура

### Сервисы в docker-compose

- `api` — backend API
- `postgres` — PostgreSQL
- `redis` — кэш
- `prometheus` — сбор метрик
- `grafana` — визуализация

### Основные таблицы

- `users`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`

---

## Что специально заложено под НТ

### 1. Read-heavy сценарий
Эндпоинты:
- `GET /products`
- `GET /products/:id`

Можно смотреть:
- latency
- throughput
- влияние Redis-кэша
- влияние искусственной задержки

Параметры:
- `slow=true`
- `limit`
- `offset`
- `sort`
- `order`
- `category`

Примеры:
- `GET /products?limit=20&offset=0`
- `GET /products?slow=true`
- `GET /products/10?slow=true`

### 2. Mixed workload
Смешанный профиль:
- login
- browsing
- cart
- order

Позволяет смотреть поведение реального пользовательского потока.

### 3. Write-heavy сценарий
Эндпоинт:
- `POST /orders/create`

Что можно анализировать:
- транзакции
- влияние внешнего dependency
- влияние connection pool PostgreSQL
- деградацию на записи
- рост p95/p99

### 4. Управляемый mock внешнего сервиса
`POST /mock/payment/charge`

Поддерживаемые сценарии:
- `ok`
- `slow`
- `error`
- `timeout`

Через `POST /orders/create` можно прокидывать:
- `paymentScenario`
- `paymentDelayMs`
- `simulatePaymentDelay`

Примеры:
- `/orders/create?paymentScenario=ok`
- `/orders/create?paymentScenario=slow`
- `/orders/create?paymentScenario=error`
- `/orders/create?paymentScenario=timeout`
- `/orders/create?paymentScenario=ok&paymentDelayMs=500`

---

## Метрики

### HTTP-метрики
- `http_requests_total`
- `http_request_duration_seconds`

### Бизнес-метрики
- `business_orders_created_total`
- `business_order_creation_duration_seconds`

### Метрики mock payment
- `payment_requests_total`
- `payment_request_duration_seconds`

---

## Переменные окружения

Основные параметры из `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super-secret-key

DB_HOST=postgres
DB_PORT=5432
DB_NAME=perf_demo
DB_USER=perf_user
DB_PASSWORD=perf_pass

DB_POOL_MAX=10
DB_POOL_MIN=0
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=5000
DB_APPLICATION_NAME=performance-demo-service

REDIS_URL=redis://redis:6379
CACHE_TTL_SECONDS=30
CACHE_ENABLED=true

PRODUCT_LIST_SLOW_MS=120
PRODUCT_DETAILS_SLOW_MS=80

PAYMENT_DELAY_MS=150
PAYMENT_TIMEOUT_MS=3000
PAYMENT_BASE_URL=http://127.0.0.1:3000/mock


Что можно крутить для экспериментов

Кэш
CACHE_ENABLED=true/false
CACHE_TTL_SECONDS=30

База
DB_POOL_MAX=10
DB_POOL_MIN=0

Искусственные задержки
PRODUCT_LIST_SLOW_MS
PRODUCT_DETAILS_SLOW_MS
PAYMENT_DELAY_MS
PAYMENT_TIMEOUT_MS