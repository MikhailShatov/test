# performance-demo-service

Собственный backend-сервис под нагрузочное тестирование.

Стек:
- Node.js + Express
- PostgreSQL
- Redis
- Prometheus
- Grafana
- Docker Compose

Сервис специально сделан так, чтобы на нём было удобно:
- писать сценарии в k6 и JMeter
- гонять smoke / load / stress / soak
- смотреть p95, error rate, throughput
- искать bottleneck'и
- делать оптимизации и сравнивать результат до/после

---

## 1. Что умеет сервис

### Эндпоинты
- `POST /auth/login`
- `GET /products`
- `GET /products/:id`
- `GET /cart`
- `POST /cart/add`
- `POST /orders/create`
- `GET /orders/:id`
- `GET /health`
- `GET /metrics`

### Бизнес-flow
1. Логин
2. Получение списка товаров
3. Получение карточки товара
4. Добавление товара в корзину
5. Создание заказа
6. Получение заказа

Это уже нормальный flow для performance-портфеля.

---

## 2. Архитектура

### Сервисы в docker-compose
- `api` — backend API
- `db` — PostgreSQL
- `redis` — кэш
- `prometheus` — сбор метрик
- `grafana` — дашборды

### Схема данных
- `users`
- `products`
- `cart_items`
- `orders`
- `order_items`

---

## 3. Где здесь точки для нагрузки

### Read-heavy
- `GET /products`
- `GET /products/:id`

### Mixed workload
- логин + просмотр каталога + корзина + заказ

### Write-heavy
- `POST /orders/create`

### Что можно анализировать
- p95 и p99 latency
- error rate
- throughput
- влияние Redis-кэша
- влияние задержек в order flow
- влияние connection pool PostgreSQL

---

## 4. Что здесь уже заложено специально

### 1. Order flow с задержками
В `createOrder()` есть искусственные задержки:
- `ORDER_PROCESSING_DELAY_MS`
- `PAYMENT_SIMULATION_DELAY_MS`

Это помогает:
- моделировать более реалистичную транзакцию
- видеть рост времени ответа под нагрузкой
- делать stress / bottleneck analysis

### 2. Кэш на products
`GET /products` использует Redis.
Это позволяет:
- сравнить первый запрос из БД и последующие из кэша
- показать влияние кэширования на latency и throughput

### 3. Транзакция при создании заказа
`POST /orders/create`:
- блокирует cart rows / product rows через `FOR UPDATE`
- проверяет stock
- пишет заказ и order_items
- обновляет остатки

Это уже хороший кандидат для нагрузки и анализа блокировок.

---

## 5. Быстрый старт

### Предварительно нужно
Установить:
- Docker Desktop
- Git

Проверить:

```bash
docker --version
docker compose version
```

---

## 6. Как запустить проект

### Шаг 1. Распаковать / склонировать проект

```bash
cd performance-demo-service
```

### Шаг 2. Проверить `.env`
Файл уже есть.
Если захочешь менять задержки или порты — редактируй `.env`.

Основные параметры:

```env
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=perf_demo
DB_USER=perf_user
DB_PASSWORD=perf_pass
REDIS_HOST=redis
REDIS_PORT=6379
PRODUCTS_CACHE_TTL=30
ORDER_PROCESSING_DELAY_MS=150
PAYMENT_SIMULATION_DELAY_MS=80
```

### Шаг 3. Поднять всё

```bash
docker compose up --build
```

### Шаг 4. Дождаться запуска
Ожидаемые сервисы:
- API: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

Grafana логин:
- login: `admin`
- password: `admin`

---

## 7. Как проверить, что всё живое

### Health check

```bash
curl http://localhost:3000/health
```

Ожидаемо:

```json
{
  "status": "ok",
  "db": "up",
  "redis": "up"
}
```

### Metrics

```bash
curl http://localhost:3000/metrics
```

Должны появиться Prometheus-метрики.

---

## 8. Как протестировать API руками

## 8.1 Логин

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mihail1@example.com","password":"pass123"}'
```

В ответе придёт JWT token.

---

## 8.2 Получить товары

```bash
curl "http://localhost:3000/products?limit=5&offset=0"
```

### Поиск

```bash
curl "http://localhost:3000/products?limit=5&search=office"
```

---

## 8.3 Получить карточку товара

```bash
curl http://localhost:3000/products/1
```

---

## 8.4 Добавить в корзину
Подставь токен из логина:

```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

---

## 8.5 Посмотреть корзину

```bash
curl http://localhost:3000/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8.6 Создать заказ

```bash
curl -X POST http://localhost:3000/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8.7 Получить заказ

```bash
curl http://localhost:3000/orders/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. Как дебажить

## 9.1 Посмотреть логи всех контейнеров

```bash
docker compose logs -f
```

## 9.2 Логи только API

```bash
docker compose logs -f api
```

## 9.3 Проверить, что контейнеры живы

```bash
docker compose ps
```

## 9.4 Зайти внутрь PostgreSQL

```bash
docker exec -it performance-demo-db psql -U perf_user -d perf_demo
```

Полезные команды внутри psql:

```sql
SELECT * FROM users;
SELECT * FROM products LIMIT 10;
SELECT * FROM cart_items;
SELECT * FROM orders;
SELECT * FROM order_items;
```

## 9.5 Зайти внутрь Redis

```bash
docker exec -it performance-demo-redis redis-cli
```

Полезные команды:

```bash
KEYS *
GET products:5:0:
```

## 9.6 Проверить API из контейнера

```bash
docker exec -it performance-demo-api sh
```

Потом внутри контейнера:

```bash
wget -qO- http://localhost:3000/health
```

---

## 10. Типовые проблемы и как их чинить

### Проблема: порт занят
Если занят `3000`, `3001`, `5432`, `6379` или `9090`, меняй проброс портов в `docker-compose.yml`.

### Проблема: контейнер API падает на старте
Смотри:

```bash
docker compose logs -f api
```

Чаще всего причина:
- DB ещё не готова
- ошибка в `.env`
- проблема с подключением к Redis

### Проблема: Grafana пустая
Проверь:
- открылся ли `http://localhost:9090`
- отвечает ли `http://localhost:3000/metrics`
- жив ли контейнер `prometheus`

### Проблема: логин не работает
Используй seeded user:
- `mihail1@example.com`
- пароль `pass123`

### Проблема: заказ не создаётся
Проверь:
- добавлен ли товар в корзину
- хватает ли stock у товара
- что показывает таблица `cart_items`

---

## 11. Как останавливать проект

```bash
docker compose down
```

Если хочешь снести и volume базы:

```bash
docker compose down -v
```

После `-v` база и seeded data пересоздадутся заново при следующем старте.

---

## 12. Как развивать дальше

### Следующий слой для performance
1. Написать `k6-performance-suite` под этот API
2. Сделать multi-scenario:
   - browse products
   - view product
   - add to cart
   - create order
3. Добавить thresholds:
   - p95
   - error rate
   - checks
4. Добавить stress и soak
5. Повторить ключевой flow в JMeter

### Что можно улучшить в самом сервисе
1. Добавить пагинацию и сортировку
2. Сделать endpoint без индекса для bottleneck demo
3. Добавить connection pool tuning
4. Добавить artificial CPU-heavy endpoint
5. Добавить background worker
6. Добавить mock payment service как отдельный контейнер

---

## 13. Идеи для bottleneck analysis

### Кейс 1. До / после Redis
- прогон без Redis-кэша
- прогон с Redis-кэшем
- сравнение latency и throughput

### Кейс 2. Увеличение задержки order flow
- `ORDER_PROCESSING_DELAY_MS=150`
- потом `500`
- потом `1000`

Смотришь, как ломается p95.

### Кейс 3. Ограничение PostgreSQL pool
В `src/db/postgres.js` уменьшить `max` с `10` до `3`.

Смотришь:
- очередь запросов
- рост response time
- деградацию create order

---

## 14. Что использовать на собесе

Этот сервис можно презентовать так:

> Я написал собственный backend под нагрузочное тестирование. Поднял PostgreSQL, Redis, Prometheus и Grafana через Docker Compose. Реализовал login, catalog, cart и order flow. На этом API запускал k6 и JMeter сценарии, анализировал latency, error rate, throughput, а также воспроизводил bottleneck'и через задержки, кэширование и настройку connection pool.

---

## 15. Мини-чеклист перед k6

Перед тем как писать нагрузочные тесты, проверь:
- `docker compose up --build` проходит без ошибок
- `/health` отвечает `ok`
- `/metrics` отдаёт метрики
- логин работает
- корзина работает
- заказ создаётся
- в Grafana появляются графики

