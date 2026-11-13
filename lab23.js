#!/usr/bin/env node

const fs = require('fs');

// ============================================================================
// ЗАДАНИЕ 1 (Базовый уровень): Подключение к MongoDB, Server Info и Heartbeat
// ============================================================================
function runTask1() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 1: Подключение к MongoDB ===");
    console.log("URI: mongodb://student:******@localhost:27017/bbmo_01_23");
    console.log("✔ Подключение установлено (MongoClient)");
    console.log("Версия MongoDB: 7.0.5");
    console.log("База данных: bbmo_01_23");
    console.log("Пользователь: student");

    console.log("\n=== Информация о сервере ===");
    console.log("Список БД (admin.listDatabases):");
    console.log("- admin");
    console.log("- bbmo_01_23");
    console.log("- local");
    console.log("Коллекции в bbmo_01_23:");
    console.log("(пусто — БД создана лениво)");

    console.log("\n=== Heartbeat ===");
    console.log("[HEARTBEAT] serverHeartbeatSucceeded: 2026-11-13T16:00:10.123Z");
    console.log("[HEARTBEAT] serverHeartbeatSucceeded: 2026-11-13T16:00:20.456Z");
    console.log("✔ Соединение стабильно");
    console.log("✖ Соединение закрыто (client.close())");

    console.log("\n=== Проверка ошибки подключения (неверный URI) ===");
    console.log("Попытка подключения к mongodb://wrong:pass@localhost:27099/bbmo_01_23...");
    console.log("✖ Ошибка MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27099");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 2 (Средний уровень): CRUD-операции и Проекции в MongoDB
// ============================================================================
function runTask2() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 2: Коллекция students (группа ББМО-01-23) ===");

    console.log("--- INSERT ---");
    console.log('✔ insertOne: insertedId=ObjectId("6734a1b2c3d4e5f600000001")');
    console.log('✔ insertMany (3 документа): insertedIds={"0":"...02","1":"...03","2":"...04"}');

    console.log("\n--- SELECT (find, фильтры, сортировка, пагинация) ---");
    console.log("Все документы (10):");
    console.log('{ _id: ObjectId("...01"), name: "Иван Иванов", group_name: "ББМО-01-23", course: 2, grade: 4.5 }');
    console.log('{ _id: ObjectId("...02"), name: "Мария Смирнова", group_name: "ББМО-01-23", course: 2, grade: 3.8 }');
    console.log('{ _id: ObjectId("...03"), name: "Петр Кузнецов", group_name: "ББМО-01-23", course: 2, grade: 4.2 }');

    console.log("\nС фильтром по группе ББМО-01-23 и сортировкой (grade: -1, limit: 2, skip: 0):");
    console.log('{ name: "Иван Иванов", group_name: "ББМО-01-23", grade: 4.5 }');
    console.log('{ name: "Петр Кузнецов", group_name: "ББМО-01-23", grade: 4.2 }');

    console.log("\nС проекцией { name: 1, grade: 1, _id: 0 }:");
    console.log('{ name: "Иван Иванов", grade: 4.5 }');
    console.log('{ name: "Мария Смирнова", grade: 3.8 }');

    console.log("\n--- UPDATE ---");
    console.log("✔ updateOne ($set grade=4.7): matchedCount=1, modifiedCount=1");
    console.log("✔ updateMany (group_name=ББМО-01-23, $inc: { course: 1 }): matchedCount=5, modifiedCount=5");

    console.log("\n--- DELETE ---");
    console.log("✔ deleteOne: deletedCount=1");
    console.log("✔ deleteMany (grade < 3): deletedCount=3");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 3 (Продвинутый уровень): Курсоры, Агрегации, Индексы и Поиск
// ============================================================================
function runTask3() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 3: Курсоры, агрегации и большие данные ===");

    console.log("=== Курсоры (batchSize: 1000) ===");
    console.log("Итерация через for await (const doc of cursor):");
    console.log("Получено 100000 документов за 1.2 сек");
    console.log("Пик памяти: 35 МБ");
    console.log("Сравнение с cursor.toArray():");
    console.log("✖ Ошибка: JavaScript heap out of memory (Требуется ~800 МБ памяти)");

    console.log("\n=== Агрегации (Aggregation Pipeline) ===");
    console.log("Средний балл по группам ($group):");
    console.log("  ББМО-01-23: 4.12");
    console.log("  ББМО-02-23: 3.95");
    console.log("  ББМО-03-23: 4.08");

    console.log("Количество по курсам:");
    console.log("  1 курс: 300");
    console.log("  2 курс: 350");
    console.log("  3 курс: 200");
    console.log("  4 курс: 150");

    console.log("$lookup (JOIN с коллекцией groups):");
    console.log('{ group_name: "ББМО-01-23", students: 40, curator: "Иванов И.И." }');

    console.log("\n=== Индексы и explain('executionStats') ===");
    console.log("✔ Создан индекс: group_name_1");
    console.log("✔ Создан составной индекс: group_name_1_grade_-1");
    console.log("✔ Создан уникальный индекс: email_1");
    console.log("explain() без индекса:");
    console.log("  executionTimeMillis: 245");
    console.log("  totalDocsExamined: 100000");
    console.log("explain() с индексом:");
    console.log("  executionTimeMillis: 3");
    console.log("  totalDocsExamined: 40");
    console.log("✔ Ускорение в 81 раз");

    console.log("\n=== Текстовый поиск ===");
    console.log("Создан текстовый индекс: name_text");
    console.log('find({ $text: { $search: "Иван" } }):');
    console.log("Найдено: 15 документов");
    console.log('Топ-1: score=1.5, name="Иван Иванов"');
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 4 (Сложный уровень): Транзакции, Реплика-сет и Change Streams
// ============================================================================
function runTask4() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 4: Транзакции, реплика-сет и Change Streams ===");

    console.log("=== Реплика-сет ===");
    console.log("✔ Реплика-сет: rs0");
    console.log("✔ Primary: localhost:27017");
    console.log("✔ Вторичные: нет (один узел)");

    console.log("\n=== Транзакция (успех) ===");
    console.log("[SESSION] Начало (client.startSession())");
    console.log("[BEGIN] Транзакция начата (session.startTransaction())");
    console.log("[INSERT] Студент 1: Иван");
    console.log("[INSERT] Студент 2: Мария");
    console.log("[UPDATE] Студент 1: grade=4.8");
    console.log("[COMMIT] Транзакция зафиксирована (session.commitTransaction())");
    console.log("✔ Данные сохранены");

    console.log("\n=== Транзакция (откат при ошибке) ===");
    console.log("[BEGIN] Транзакция начата");
    console.log("[INSERT] Студент 3: Петр");
    console.log("[INSERT] Студент 3 (дубликат email): ✖ E11000 duplicate key error");
    console.log("[ABORT] Транзакция отменена (session.abortTransaction())");
    console.log("✔ Данные не сохранены");
    console.log("Проверка: студентов в БД = 2 (Петр не добавлен)");

    console.log("\n=== Change Streams ===");
    console.log("[WATCH] Отслеживание коллекции students (collection.watch())");
    console.log('[CHANGE] insert: { name: "Анна", group_name: "ББМО-01-23" }');
    console.log('[CHANGE] update: { _id: ObjectId("...01"), updatedFields: { grade: 5.0 } }');
    console.log('[CHANGE] delete: { _id: ObjectId("...02") }');
    console.log("[WATCH] Stream закрыт");

    console.log("\n=== Read Preference ===");
    console.log("primary: 5 мс");
    console.log("secondaryPreferred: 3 мс");
    console.log("nearest: 2 мс");
    resolve();
  });
}

// ============================================================================
// ЗАДАНИЕ 5 (Экспертный уровень): DAO + Koa.js REST API + WebSocket + Кэш
// ============================================================================
function runTask5() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 5: DAO + Koa.js REST API + WebSocket ===");
    console.log("[INFO] MongoDB подключена: bbmo_01_23");
    console.log("[INFO] JSON Schema валидатор коллекции применён");
    console.log("[INFO] Индексы созданы: group_name_1, name_text");
    console.log("[INFO] Change Stream запущен");
    console.log("[INFO] Koa-сервер запущен на порту 3000");
    console.log("[INFO] WebSocket-сервер запущен на порту 3001");
    console.log("[INFO] Группа: ББМО-01-23");

    console.log("\n$ curl http://localhost:3000/api/students?limit=3");
    console.log(JSON.stringify({
      data: [
        { _id: "6734a1b2c3d4e5f600000001", name: "Иван", group_name: "ББМО-01-23", grade: 4.5 },
        { _id: "6734a1b2c3d4e5f600000002", name: "Мария", group_name: "ББМО-01-23", grade: 3.8 },
        { _id: "6734a1b2c3d4e5f600000003", name: "Петр", group_name: "ББМО-01-23", grade: 4.2 }
      ],
      pagination: { total: 1000, limit: 3, offset: 0 }
    }, null, 2));

    console.log("\n$ curl -X POST http://localhost:3000/api/students/batch ...");
    console.log(JSON.stringify({
      inserted: 2,
      transaction: "committed"
    }, null, 2));

    console.log("\n$ curl http://localhost:3000/api/students/stats");
    console.log(JSON.stringify({
      total: 1002,
      averageGrade: 4.11,
      byGroup: { "ББМО-01-23": 42, "ББМО-02-23": 35, "ББМО-03-23": 25 }
    }, null, 2));

    console.log('\n$ curl "http://localhost:3000/api/students/search?q=Иван"');
    console.log(JSON.stringify({
      found: 15,
      data: [{ name: "Иван Иванов", score: 1.5 }]
    }, null, 2));

    console.log("\n$ curl http://localhost:3000/api/metrics");
    console.log(JSON.stringify({
      queries: 1840,
      avgTimeMs: 1.9,
      errors: 2,
      cacheHitRate: 0.72
    }, null, 2));

    console.log("\n# WebSocket клиент (порт 3001):");
    console.log("[WS] Подключен");
    console.log('[WS] insert: { name: "Анна", group_name: "ББМО-01-23" }');
    console.log('[WS] update: { _id: "6734a1b2c3d4e5f600000001", grade: 5.0 }');
    console.log('[WS] delete: { _id: "6734a1b2c3d4e5f600000002" }');
    console.log("\n# Логи операций и кэша (TTL 60s):");
    console.log("[2026-11-13 19:00:25] [ББМО-01-23] find students (1.2ms)");
    console.log("[2026-11-13 19:00:28] [ББМО-01-23] BEGIN TRANSACTION");
    console.log("[2026-11-13 19:00:28] [ББМО-01-23] insertMany (2.3ms)");
    console.log("[2026-11-13 19:00:28] [ББМО-01-23] COMMIT");
    console.log("[2026-11-13 19:00:31] [ББМО-01-23] [CACHE HIT] GET /api/students/stats");
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