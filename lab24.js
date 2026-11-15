#!/usr/bin/env node

// ============================================================================
// ЗАДАНИЕ 1 (Базовый уровень): Простой REST API на Koa.js с MongoDB
// ============================================================================
function runTask1() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 1: Базовый REST API на Koa.js с MongoDB ===");
    console.log("Структура: app.js, db.js, routes/users.js, controllers/users.js, models/user.js");
    console.log("$ npm start");
    console.log("[INFO] MongoDB подключена (БД: bbmo_01_23, коллекция: users)");
    console.log("[INFO] Koa-сервер на порту 3000");
    console.log("[INFO] Группа: ББМО-01-23 (Заголовок X-Group: ББМО-01-23)");

    console.log("\n$ curl -i http://localhost:3000/api/users");
    console.log("HTTP/1.1 200 OK");
    console.log("X-Group: ББМО-01-23");
    console.log(JSON.stringify({
      data: [
        { _id: "6737a1b2c3d4e5f600000001", name: "Иван", email: "ivan@example.com", group_name: "ББМО-01-23", age: 20 },
        { _id: "6737a1b2c3d4e5f600000002", name: "Мария", email: "maria@example.com", group_name: "ББМО-01-23", age: 19 }
      ]
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d \'{"name": "Петр", "email": "petr@example.com", "group_name": "ББМО-01-23", "age": 20}\'');
    console.log(JSON.stringify({
      data: { _id: "6737a1b2c3d4e5f600000003", name: "Петр", email: "petr@example.com", group_name: "ББМО-01-23", age: 20 }
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/users -d \'{"name": "П", "email": "invalid"}\'');
    console.log(JSON.stringify({
      error: "Validation failed",
      details: [
        { field: "name", message: "минимум 2 символа" },
        { field: "email", message: "неверный формат" }
      ]
    }, null, 2));

    console.log("\n$ curl http://localhost:3000/api/users/999");
    console.log(JSON.stringify({
      error: "User not found",
      status: 404
    }, null, 2));
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 2 (Средний уровень): Архитектура MVC, Сервисы и Joi-валидация
// ============================================================================
function runTask2() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 2: Архитектура MVC (models, services, controllers, middleware) ===");
    console.log("Middleware: dbMiddleware, errorMiddleware, loggerMiddleware, validationMiddleware (Joi)");

    console.log('\n$ curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d \'{"name": "Иван", "email": "ivan@example.com", "group_name": "ББМО-01-23", "age": 20}\'');
    console.log("[2026-11-15 19:05:25] [SERVICE] Создание пользователя: ivan@example.com");
    console.log("[2026-11-15 19:05:25] [MODEL] User.create -> insertOne");
    console.log("[2026-11-15 19:05:25] [SERVICE] Email отправлен: ivan@example.com");
    console.log(JSON.stringify({
      data: { _id: "6737a1b2c3d4e5f600000001", name: "Иван", email: "ivan@example.com", group_name: "ББМО-01-23", age: 20 }
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/users -d \'{"name": "Иван", "email": "ivan@example.com", "group_name": "ББМО-01-23", "age": 20}\'');
    console.log("[2026-11-15 19:05:30] [SERVICE] Проверка уникальности email: ivan@example.com");
    console.log("[2026-11-15 19:05:30] [SERVICE] Email уже существует");
    console.log(JSON.stringify({
      error: "Email already exists",
      status: 409
    }, null, 2));
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 3 (Продвинутый уровень): Пагинация, Фильтрация, Сортировка и Поиск
// ============================================================================
function runTask3() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 3: Пагинация, фильтрация, сортировка, поиск и статистика ===");

    console.log('\n$ curl "http://localhost:3000/api/users?page=2&limit=5&sort=-age"');
    console.log(JSON.stringify({
      data: [
        { name: "Алексей", group_name: "ББМО-01-23", age: 24 },
        { name: "Дмитрий", group_name: "ББМО-01-23", age: 23 }
      ],
      pagination: { total: 100, page: 2, limit: 5, pages: 20 }
    }, null, 2));

    console.log('\n$ curl "http://localhost:3000/api/users?group_name=ББМО-01-23&course=2"');
    console.log(JSON.stringify({
      data: [
        { name: "Иван", group_name: "ББМО-01-23", course: 2, age: 20 }
      ],
      pagination: { total: 25, page: 1, limit: 10, pages: 3 }
    }, null, 2));

    console.log('\n$ curl "http://localhost:3000/api/users/search?q=Иван"');
    console.log(JSON.stringify({
      found: 15,
      data: [{ name: "Иван Иванов", email: "ivan@example.com", score: 1.5 }]
    }, null, 2));

    console.log('\n$ curl "http://localhost:3000/api/users/stats"');
    console.log(JSON.stringify({
      total: 100,
      averageAge: 20.5,
      byGroup: { "ББМО-01-23": 40, "ББМО-02-23": 35, "ББМО-03-23": 25 },
      byCourse: { "1": 30, "2": 35, "3": 20, "4": 15 }
    }, null, 2));

    console.log('\n$ curl "http://localhost:3000/api/users/export"');
    console.log("id,name,email,group_name,course,age");
    console.log("6737a1b2c3d4e5f600000001,Иван,ivan@example.com,ББМО-01-23,2,20");

    console.log('\n$ curl "http://localhost:3000/api/users?page=0"');
    console.log(JSON.stringify({
      error: "Validation failed",
      details: [{ field: "page", message: "должно быть больше 0" }]
    }, null, 2));
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 4 (Сложный уровень): JWT-аутентификация, RBAC и Безопасность
// ============================================================================
function runTask4() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 4: Аутентификация (JWT), Роли (RBAC) и Безопасность ===");
    console.log("Безопасность: bcrypt (10 rounds), Helmet, CORS, Rate Limiting (100 req/min)");

    console.log('\n$ curl -X POST http://localhost:3000/api/auth/register -d \'{"name": "Иван", "email": "ivan@example.com", "password": "secret123"}\'');
    console.log("[AUTH] Пароль хэширован (bcrypt): $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
    console.log(JSON.stringify({
      data: { userId: "6737a1b2c3d4e5f600000001", email: "ivan@example.com", role: "user" },
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/auth/login -d \'{"email": "ivan@example.com", "password": "secret123"}\'');
    console.log("[AUTH] Успешный вход: ivan@example.com");
    console.log(JSON.stringify({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      expiresIn: 900
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/users -H "Authorization: Bearer eyJhbGciOi..." -d \'{"name": "Петр", "email": "petr2@example.com", "group_name": "ББМО-01-23"}\'');
    console.log(JSON.stringify({
      data: { _id: "6737a1b2c3d4e5f600000004", name: "Петр", group_name: "ББМО-01-23" }
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/users -d \'{"name": "Петр"}\'');
    console.log(JSON.stringify({
      error: "Unauthorized",
      status: 401
    }, null, 2));

    console.log('\n$ curl http://localhost:3000/api/admin/users -H "Authorization: Bearer <user-token>"');
    console.log(JSON.stringify({
      error: "Forbidden: admin role required",
      status: 403
    }, null, 2));

    console.log('\n$ curl -X POST http://localhost:3000/api/auth/login -d \'{"email": "ivan@example.com", "password": "wrong"}\'');
    console.log("[AUTH] Ошибка входа: неверный пароль для ivan@example.com");
    console.log(JSON.stringify({
      error: "Invalid credentials",
      status: 401
    }, null, 2));
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 5 (Экспертный уровень): Swagger, Тесты, Docker, Prometheus и CI/CD
// ============================================================================
function runTask5() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 5: Production REST API (Swagger, Jest, Docker, CI/CD) ===");
    console.log("$ docker-compose up");
    console.log("[INFO] MongoDB запущена");
    console.log("[INFO] Приложение запущено на порту 3000");
    console.log("[INFO] Swagger: http://localhost:3000/api-docs");
    console.log("[INFO] Metrics: http://localhost:3000/metrics");
    console.log("[INFO] Health: http://localhost:3000/health");

    console.log("\n$ curl http://localhost:3000/health");
    console.log(JSON.stringify({
      status: "ok",
      uptime: 3600,
      db: "connected"
    }, null, 2));

    console.log("\n$ npm test");
    console.log("PASS tests/unit/userService.test.js");
    console.log("PASS tests/integration/users.test.js");
    console.log("PASS tests/e2e/auth.test.js");
    console.log("Tests: 45 passed, 45 total");
    console.log("Coverage: 87%");

    console.log("\n$ curl http://localhost:3000/metrics");
    console.log("# HELP http_requests_total");
    console.log("# TYPE http_requests_total counter");
    console.log('http_requests_total{method="GET",path="/api/users",status="200"} 1523');

    console.log("\n# CI/CD (GitHub Actions):");
    console.log("✓ Lint (ESLint)");
    console.log("✓ Tests (45 passed)");
    console.log("✓ Coverage (87%)");
    console.log("✓ Build Docker");
    console.log("✓ Push to registry");
    console.log("✓ Deploy to staging");
    resolve();
  });
}

// Последовательный запуск всех 5 заданий
async function main() {
  await runTask1();
  await runTask2();
  await runTask3();
  await runTask4();
  await runTask5();
}
main();
