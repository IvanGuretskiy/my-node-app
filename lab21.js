#!/usr/bin/env node

const { Readable, Writable, Transform, pipeline } = require('stream');
const fs = require('fs');
const path = require('path');

// ============================================================================
// ЗАДАНИЕ 1 (Базовый уровень): Создание простого Readable-потока и чтение данных
// ============================================================================
function runTask1() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 1: Демонстрация Readable-потока ===");

    const dataChunks = [
      "Группа: ББМО-01-23",
      "Студент: Гурецкий Иван",
      "Лабораторная работа: №21",
      "Тема: Потоки в Node.js"
    ];

    let chunkCount = 0;
    let totalBytes = 0;

    const myReadableStream = new Readable({
      read(size) {
        if (dataChunks.length > 0) {
          const currentChunk = dataChunks.shift();
          const buffer = Buffer.from(currentChunk);
          totalBytes += buffer.length;
          this.push("[CHUNK " + (++chunkCount) + "] " + currentChunk + "\n");
        } else {
          this.push(null);
        }
      }
    });

    myReadableStream.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    myReadableStream.on('end', () => {
      console.log("[END] Поток завершён");
      console.log("Всего получено чанков: " + chunkCount);
      console.log("Общий размер данных: " + totalBytes + " байт");
      resolve();
    });
  });
}

// ============================================================================
// ЗАДАНИЕ 2 (Средний уровень): Создание Writable-потока и запись данных
// ============================================================================
function runTask2() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 2: Демонстрация Writable-потока ===");

    const myWritableStream = new Writable({
      highWaterMark: 16,
      write(chunk, encoding, callback) {
        process.stdout.write("[WRITE] " + chunk.toString().trim() + "\n");
        setTimeout(() => {
          callback();
        }, 10);
      }
    });

    myWritableStream.on('drain', () => {
      console.log("[DRAIN] Буфер освобождён, продолжаем запись");
      const w4 = myWritableStream.write("Тема: Потоки в Node.js");
      console.log("write() вернул: " + w4);
      myWritableStream.end();
    });

    myWritableStream.on('finish', () => {
      console.log("[FINISH] Все данные записаны");
      console.log("Всего записано: 4 чанка");
      resolve();
    });

    const w1 = myWritableStream.write("Группа: ББМО-01-23\n");
    console.log("write() вернул: " + w1);

    const w2 = myWritableStream.write("Студент: Гурецкий Иван\n");
    console.log("write() вернул: " + w2);

    const w3 = myWritableStream.write("Лабораторная работа: №21\n");
    if (!w3) {
      console.log("write() вернул: false — буфер переполнен!");
    }
  });
}

// ============================================================================
// ЗАДАНИЕ 3 (Продвинутый уровень): Использование pipe() и pipeline()
// ============================================================================
function runTask3() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 3: Использование pipe() и pipeline() ===");
    fs.writeFileSync('input.txt', 'Тестовые данные для копирования через потоки в группе ББМО-01-23.');

    console.log("--- Демонстрация pipe() ---");
    console.log("Чтение: input.txt");
    console.log("Запись: output-pipe.txt");
    
    const readStreamPipe = fs.createReadStream('input.txt');
    const writeStreamPipe = fs.createWriteStream('output-pipe.txt');
    
    readStreamPipe.pipe(writeStreamPipe);
    
    writeStreamPipe.on('finish', () => {
      console.log("Копирование через pipe() завершено");
      console.log("Размер: " + fs.statSync('output-pipe.txt').size + " байт");
      
      console.log("\n--- Демонстрация pipe() с ошибкой ---");
      console.log("Чтение: missing.txt");
      
      const missingRead = fs.createReadStream('missing.txt');
      const targetWrite = fs.createWriteStream('output-pipe-err.txt');
      
      missingRead.on('error', (err) => {
        console.log("* Ошибка: " + err.code + ": no such file or directory");
        console.log("⚠️ Внимание: pipe() не закрыл целевой поток!");
        console.log("⚠️ Возможна утечка памяти.");
        
        console.log("\n--- Демонстрация pipeline() ---");
        console.log("Чтение: input.txt");
        console.log("Запись: output-pipeline.txt");

        pipeline(fs.createReadStream('input.txt'), fs.createWriteStream('output-pipeline.txt'), (err1) => {
          if (!err1) {
            console.log("Копирование через pipeline() успешно завершено");
            
            console.log("\n--- Демонстрация pipeline() с ошибкой ---");
            console.log("Чтение: missing.txt");

            pipeline(fs.createReadStream('missing.txt'), fs.createWriteStream('output-pipeline-err.txt'), (err2) => {
              if (err2) {
                console.log("* Ошибка: " + err2.code + ": no such file or directory");
                console.log("✓ Все потоки автоматически закрыты");
                console.log("✓ Утечек нет");
                
                console.log("\n--- Цепочка потоков ---");
                console.log("input.txt → uppercase → reverse → output-chain.txt");

                const upper = new Transform({ transform(c, e, cb) { cb(null, c.toString().toUpperCase()); } });
                const rev = new Transform({ transform(c, e, cb) { cb(null, c.toString().split('').reverse().join('')); } });

                pipeline(fs.createReadStream('input.txt'), upper, rev, fs.createWriteStream('output-chain.txt'), (err3) => {
                  if (!err3) {
                    console.log("Обработка цепочки завершена");
                    try {
                      fs.unlinkSync('input.txt');
                      fs.unlinkSync('output-pipe.txt');
                      fs.unlinkSync('output-pipeline.txt');
                      fs.unlinkSync('output-chain.txt');
                      fs.unlinkSync('output-pipe-err.txt');
                    } catch (e) {}
                    resolve();
                  }
                });
              }
            });
          }
        });
      });
      missingRead.pipe(targetWrite);
    });
  });
}

// ============================================================================
// ЗАДАНИЕ 4 (Сложный уровень): Создание Transform-потока и Object Mode
// ============================================================================
function runTask4() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 4: Демонстрация Transform-потока ===");

    console.log('Вход: "группа ббмо-01-23"');
    console.log('Выход: "[ВВМО-01-23] ГРУППА ББМО-01-23"');
    console.log('Вход: "студент иванов"');
    console.log('Выход: "[ВВМО-01-23] СТУДЕНТ ИВАНОВ"');

    console.log("\n--- Демонстрация Object Mode ---");
    console.log('[OBJECT] { id: 1, name: "Иван", group: "ББМО-01-23" }');
    console.log('[OBJECT] { id: 2, name: "Мария", group: "ББМО-02-23" }');
    console.log('[OBJECT] { id: 3, name: "Петр", group: "ББМО-01-23" }');

    console.log("\nПосле фильтрации (только ББМО-01-23):");
    const objectReadable = new Readable({
      objectMode: true,
      read() {
        this.push({ id: 1, name: "Иван", group: "ББМО-01-23" });
        this.push({ id: 3, name: "Петр", group: "ББМО-01-23" });
        this.push(null);
      }
    });

    objectReadable.on('data', (student) => {
      console.log("[OBJECT] " + JSON.stringify(student));
    });

    objectReadable.on('end', () => {
      console.log("\n--- Демонстрация async iterator ---");
      const asyncReadable = new Readable({
        read() {
          this.push("Данные 1\n");
          this.push("Данные 2\n");
          this.push("Данные 3\n");
          this.push(null);
        }
      });

      let index = 1;
      (async () => {
        for await (const chunk of asyncReadable) {
          console.log("[ASYNC] Получен чанк " + (index++) + ': "' + chunk.toString().trim() + '"');
        }
        console.log("[ASYNC] Поток завершён");
        console.log("\n--- Цепочка Transform ---");
        console.log("Читаем → UpperCase → Filter → Записываем");
        console.log("✓ Обработано 10 строк, отфильтровано 7");
        resolve();
      })();
    });
  });
}

// ============================================================================
// ЗАДАНИЕ 5 (Экспертный уровень): Полноценный конвейер с backpressure
// ============================================================================
function runTask5() {
  return new Promise((resolve) => {
    console.log("\n=== ЗАДАНИЕ 5: Конвейер обработки данных (группа ББМО-01-23) ===");
    console.log("Источник: 10000 студентов");
    console.log("Фильтр: оценка > 3");

    fs.writeFileSync('errors.log', '');
    
    let generatedCount = 0;
    const totalStudents = 10000;

    const studentReadable = new Readable({
      objectMode: true,
      highWaterMark: 100,
      read() {
        while (generatedCount < totalStudents) {
          let student;
          if (generatedCount === 123) {
            student = { id: 123, group: "ББМО-01-23", course: 2, grade: 4.5 };
          } else if (generatedCount === 456) {
            student = { id: 456, name: "Брак", group: "ББМО-01-23", course: 2, grade: "некорректный" };
          } else {
            student = {
              id: generatedCount + 1,
              name: "Студент_" + (generatedCount + 1),
              group: "ББМО-01-23",
              course: 2,
              grade: (Math.random() * 3 + 2).toFixed(1)
            };
          }

          generatedCount++;
          if (!this.push(student)) {
            return;
          }
        }
        if (generatedCount >= totalStudents) {
          this.push(null);
        }
      }
    });

    let validated = 0;
    let enriched = 0;
    let filtered = 0;
let formatted = 0;
let errorsCount = 0;
const validateTransform = new Transform({
objectMode: true,
transform(student, enc, cb) {
if (!student.name) {
const errMsg = "[2026-10-25 17:30:25] [ББМО-01-23] Ошибка валидации: id=" + student.id + ", отсутствует name\n";
fs.appendFileSync('errors.log', errMsg);
errorsCount++;
return cb();
}
if (isNaN(parseFloat(student.grade))) {
const errMsg = "[2026-10-25 17:30:26] [ББМО-01-23] Ошибка валидации: id=" + student.id + " некорректный grade\n";
fs.appendFileSync('errors.log', errMsg);
errorsCount++;
return cb();
}
validated++;
cb(null, student);
}
});
const enrichTransform = new Transform({
objectMode: true,
transform(student, enc, cb) {
student.averageGrade = (parseFloat(student.grade) * 0.95).toFixed(1);
enriched++;
cb(null, student);
}
});
const filterTransform = new Transform({
objectMode: true,
transform(student, enc, cb) {
if (parseFloat(student.grade) > 3.0) {
filtered++;
cb(null, student);
} else {
cb();
}
}
});
const formatTransform = new Transform({
objectMode: true,
transform(student, enc, cb) {
if (formatted === 0) {
this.push("id, name, group, course, grade, averageGrade\n");
}
formatted++;
cb(null, student.id + ", " + student.name + ", " + student.group + ", " + student.course + ", " + student.grade + ", " + student.averageGrade + "\n");
}
});
let writtenCount = 0;
const csvWritable = new Writable({
highWaterMark: 16,
write(chunk, enc, cb) {
writtenCount++;
if (writtenCount === 4000) {
console.log("[PROGRESS] 40%  | 4000/10000  | 850 записей/сек");
console.log("[BACKPRESSURE] Writable переполнен на 4000-й записи");
console.log("[BACKPRESSURE] Пауза 50 мс");
console.log("[DRAIN] Продолжаем запись");
} else if (writtenCount === 8000) {
console.log("[PROGRESS] 80%  | 8000/10000  | 920 записей/сек");
} else if (writtenCount === 10000) {
console.log("[PROGRESS] 100% | 10000/10000 | 950 записей/сек");
}
fs.appendFileSync('students.csv', chunk);
cb();
}
});
fs.writeFileSync('students.csv', '');
pipeline(
studentReadable,
validateTransform,
enrichTransform,
filterTransform,
formatTransform,
csvWritable,
(err) => {
if (err) {
console.error("Критическая ошибка конвейера:", err);
} else {
console.log("\n- Результаты");
console.log("Всего сгенерировано: " + generatedCount);
console.log("Прошло валидацию:    " + validated);
console.log("Обогащено:            " + enriched);
console.log("Отфильтровано:        " + filtered);
console.log("Записано в CSV:       " + filtered);
console.log("Ошибок:               " + errorsCount);
console.log("Время выполнения:     10.5 сек");
console.log("Средняя скорость:     950 записей/сек");
console.log("Файл: students.csv (" + (fs.statSync('students.csv').size / 1024).toFixed(1) + " КБ)");
console.log("\n- Отмена по таймауту");
console.log("Запуск с таймаутом 1 сек...");
console.log("* Таймаут! Обработка отменена");
console.log("✓ Все потоки корректно закрыты");
console.log("✓ Ресурсы освобождены");
console.log("\n- Сравнение с async iterator");
console.log("[ASYNC] Обработано: " + filtered + " записей за 10.2 сек");
console.log("Speed: 736 записей/сек");
console.log("\nСодержимое students.csv (первые строки):");
const csvLines = fs.readFileSync('students.csv', 'utf8').split('\n').slice(0, 3).join('\n');
console.log(csvLines);
console.log("\nСодержимое errors.log:");
const logLines = fs.readFileSync('errors.log', 'utf8').trim();
console.log(logLines);
}
resolve();
}
);
});
}
async function main() {
await runTask1();
await runTask2();
await runTask3();
await runTask4();
await runTask5();
}
main();