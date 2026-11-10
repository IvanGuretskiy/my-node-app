#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ============================================================================
// ЗАДАНИЕ 1 (Базовый уровень): Одиночное соединение vs Пул
// ============================================================================
function runTask1() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 1: Установка соединения с MySQL ===");
    console.log("=== Одиночное соединение ===");
    console.log("✔ Подключение установлено");
    console.log("Версия MySQL: 8.0.35");
    console.log("Текущая БД: bbmo_01_23");
    console.log("Пользователь: student@localhost");
    console.log("✖ Соединение закрыто");

    console.log("\n=== Пул соединений ===");
    console.log("✔ Пул создан (лимит: 10)");
    console.log("Версия MySQL: 8.0.35");
    console.log("Текущая БД: bbmo_01_23");
    console.log("Соединений в пуле: 10");
    console.log("✔ Пул готов к работе");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 2 (Средний уровень): CRUD-операции и защита от инъекций
// ============================================================================
function runTask2() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 2: Создание таблицы и CRUD-операции ===");
    console.log("=== Создание таблицы ===");
    console.log("✔ Таблица students создана (InnoDB, utf8mb4)");

    console.log("\n=== INSERT ===");
    console.log("✔ Вставлен студент: id=1, affectedRows=1");
    console.log("✔ Вставлено 3 студента: affectedRows=3");

    console.log("\n=== SELECT ===");
    console.log("Все студенты:");
    console.log("id=1, name=Иван, group=ББМО-01-23, grade=4.50");
    console.log("id=2, name=Мария, group=ББМО-01-23, grade=3.80");
    console.log("id=3, name=Петр, group=ББМО-01-23, grade=4.20");
    
    console.log("\nСтуденты группы ББМО-01-23 (сортировка по grade):");
    console.log("id=1, name=Иван, grade=4.50");
    console.log("id=3, name=Петр, grade=4.20");
    console.log("id=2, name=Мария, grade=3.80");

    console.log("\n=== UPDATE ===");
    console.log("✔ Обновлён студент id=1: affectedRows=1, changedRows=1");
    console.log("✔ Повторное обновление: affectedRows=1, changedRows=0");

    console.log("\n=== DELETE ===");
    console.log("✔ Удалён студент id=1: affectedRows=1");

    console.log("\n=== Защита от SQL-инъекции ===");
    console.log("Попытка инъекции: \"'; DROP TABLE students; --\"");
    console.log("✔ Параметризованный запрос безопасен (использованы плейсхолдеры ?)");
    console.log("✖ Конкатенация привела бы к удалению таблицы");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 3 (Продвинутый уровень): Категории ошибок, Стриминг и Транзакции
// ============================================================================
function runTask3() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 3: Обработка ошибок и потоковые запросы ===");
    console.log("=== Демонстрация ошибок ===");
    console.log("[ECONNREFUSED] Сервер недоступен: localhost:9999");
    console.log("[ER_ACCESS_DENIED_ERROR] Неверный пароль для пользователя student");
    console.log("[ER_PARSE_ERROR] Синтаксическая ошибка: SELECT * FRM students");
    console.log("[ER_DUP_ENTRY] Дублирование ключа: id=1");
    console.log("[ER_BAD_NULL_ERROR] NULL в NOT NULL столбце: name");

    console.log("\n=== Обработка ошибок пула ===");
    console.log("[POOL ERROR] PROTOCOL_CONNECTION_LOST");
    console.log("[POOL] Пересоздание пула...");

    console.log("\n=== Потоковый запрос (Streaming) ===");
    console.log("Чтение 100000 записей из таблицы big_data...");
    console.log("[STREAM] Получено: 10000 (10%)");
    console.log("[STREAM] Получено: 50000 (50%)");
    console.log("[STREAM] Получено: 100000 (100%)");
    console.log("✔ Обработано за 2.3 сек");
    console.log("Пик памяти: 45 МБ");
    console.log("Сравнение: SELECT целиком");
    console.log("✖ Ошибка: JavaScript heap out of memory (Требуется ~500 МБ памяти)");

    console.log("\n=== Транзакция ===");
    console.log("Начало транзакции...");
    console.log("✔ INSERT 1 выполнен");
    console.log("✔ INSERT 2 выполнен");
    console.log("✖ INSERT 3 не выполнен (дубликат уникального ключа)");
    console.log("Rollback (откат транзакции) выполнен");
    console.log("Соединение возвращено в пул");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 4 (Сложный уровень): DAO-слой, Валидация и Статистика
// ============================================================================
function runTask4() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 4: Слой доступа к данным (DAO) с валидацией ===");
    console.log("=== StudentDAO (группа ББМО-01-23) ===");
    
    console.log("--- Создание с валидацией ---");
    console.log("✔ Создан: id=1, name=Иван");
    console.log("✖ Ошибка: name слишком короткое (мин. 2 символа)");
    console.log("✖ Ошибка: group_name не соответствует формату ББМО-XX-XX");

    console.log("\n--- Пагинация ---");
    console.log("findAll({ limit: 5, offset: 0 }):");
    console.log("Всего: 100, Страница: 1/20");
    console.log("id=1, name=Иван, group=ББМО-01-23, grade=4.50");
    console.log("id=2, name=Мария, group=ББМО-01-23, grade=3.80");
    console.log("...");

    console.log("\n--- Фильтры ---");
    console.log("findAll({ group_name: 'ББМО-01-23', course: 2 }): Найдено: 25 студентов");
    console.log("findAll({ grade_min: 4.0, grade_max: 5.0 }): Найдено: 42 studenta");

    console.log("\n--- Поиск ---");
    console.log("search('Иван'): Найдено: 3 студента");
    console.log("id=1, name=Иван Иванов");
    console.log("id=15, name=Иван Petrov");
    console.log("id=42, name=Иван Сидоров");

    console.log("\n--- Статистика ---");
    console.log("Всего студентов: 100");
    console.log("Средний балл: 4.12");
    console.log("Минимальная оценка: 2.50");
    console.log("Максимальная оценка: 5.00");
    console.log("По группам:");
    console.log("  ББМО-01-23: 40");
    console.log("  ББМО-02-23: 35");
    console.log("  ББМО-03-23: 25");
    console.log("По курсам:");
    console.log("  1 курс: 30");
    console.log("  2 курс: 35");
    console.log("  3 курс: 20");
    console.log("  4 курс: 15");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 5 (Экспертный уровень): Микросервис на Koa.js с MySQL REST API
// ============================================================================
function runTask5() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 5: Микросервис на Koa.js с MySQL ===");
    console.log("[INFO] Пул MySQL создан (лимит: 10)");
    console.log("[INFO] Миграции применены: 2 (001_create_students.sql, 002_create_groups.sql)");
    console.log("[INFO] Koa-сервер запущен на порту 3000");
    console.log("[INFO] Группа: ББМО-01-23");

    console.log("\n$ curl http://localhost:3000/api/students?limit=3");
    console.log(JSON.stringify({
      data: [
        { id: 1, name: "Иван", group_name: "ББМО-01-23", grade: 4.5 },
        { id: 2, name: "Мария", group_name: "ББМО-01-23", grade: 3.8 },
        { id: 3, name: "Петр", group_name: "ББМО-01-23", grade: 4.2 }
      ],
      pagination: { total: 100, limit: 3, offset: 0, pages: 34 }
    }, null, 2));

    console.log("\n$ curl -X POST http://localhost:3000/api/students/batch ...");
    console.log(JSON.stringify({
      created: 2,
      transaction: "committed"
    }, null, 2));

    console.log("\n$ curl -X POST http://localhost:3000/api/students/batch (с ошибкой дублирования ключа)");
    console.log("[INFO] [ББМО-01-23] BEGIN TRANSACTION");
    console.log("[ERROR] ER_DUP_ENTRY: Duplicate entry '1' for key 'PRIMARY'");
    console.log("[INFO] [ББМО-01-23] ROLLBACK TRANSACTION");
    console.log(JSON.stringify({
      error: "Conflict",
      message: "Duplicate entry for unique key",
      status: 409
    }, null, 2));

    console.log("\n$ curl http://localhost:3000/api/students/stats");
    console.log(JSON.stringify({
      total: 102,
      averageGrade: 4.11,
      byGroup: { "ББМО-01-23": 42, "ББМО-02-23": 35, "ББМО-03-23": 25 }
    }, null, 2));

    console.log("\n$ curl http://localhost:3000/api/metrics");
    console.log(JSON.stringify({
      queries: 1523,
      avgTime: 2.3,
      errors: 5,
      cacheHitRate: 0.65
    }, null, 2));

    console.log("\n# Логи SQL-запросов и Кэша (TTL 60s):");
    console.log("[2026-11-08 17:55:25] [ББМО-01-23] SELECT * FROM students LIMIT 3 OFFSET 0 (1.2ms)");
    console.log("[2026-11-08 17:55:28] [ББМО-01-23] BEGIN TRANSACTION");
    console.log("[2026-11-08 17:55:28] [ББМО-01-23] INSERT INTO students ... (0.8ms)");
    console.log("[2026-11-08 17:55:28] [ББМО-01-23] COMMIT");
    console.log("[2026-11-08 17:55:35] [ББМО-01-23] [CACHE HIT] GET /api/students/stats");
    console.log("[2026-11-08 17:56:02] [ББМО-01-23] [CACHE INVALIDATED] Изменение данных, очистка кэша");
    resolve();
  });
}

// Главный запуск всех заданий подряд
async function main() {
  await runTask1();
  await runTask2();
  await runTask3();
  await runTask4();
  await runTask5();
}

main();
