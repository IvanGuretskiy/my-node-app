import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';

const VARIANT = 6;
const DATA_FILE = path.resolve(`data_${VARIANT}.txt`);
const RESULT_FILE = path.resolve(`processed_${VARIANT}.txt`);
const TOTAL_LINES = 100000;

// 1. Функция генерации файла через поток записи (Writable Stream)
async function generateLargeFile() {
    try {
        await fsp.access(DATA_FILE);
        console.log(`ℹ️  Файл ${path.basename(DATA_FILE)} уже существует, генерация не требуется.`);
    } catch {
        console.log(`📝 Генерируем файл ${path.basename(DATA_FILE)} на ${TOTAL_LINES.toLocaleString()} строк...`);
        const writeStream = fs.createWriteStream(DATA_FILE, 'utf-8');
        
        for (let i = 1; i <= TOTAL_LINES; i++) {
            const randomNum = Math.floor(Math.random() * 1000) + 1;
            const line = `${i}, ${randomNum}, Вариант ${VARIANT}\n`;
            
            // Если буфер переполнен, ждем события 'drain'
            if (!writeStream.write(line)) {
                await new Promise(resolve => writeStream.once('drain', resolve));
            }
        }
        writeStream.end();
        await new Promise(resolve => writeStream.on('finish', resolve));
        console.log('✅ Генерация файла успешно завершена!');
    }
}

// 2-3. Функция обработки файла через Чтение Потока (Readable Stream) с буфером 64 КБ
async function processLargeFile() {
    const startTime = process.hrtime.bigint();
    
    // Получаем размер файла для вывода в консоль
    const fileStat = await fsp.stat(DATA_FILE);
    const fileSizeMb = (fileStat.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n📊 Обработка файла: ${path.basename(DATA_FILE)}`);
    console.log(`Размер файла: ${fileSizeMb} МБ`);

    let totalRows = 0;
    let sum = 0;
    let maxNum = -Infinity;
    let minNum = Infinity;
    
    // Карта для подсчета частоты выпадания чисел (для доп. условия)
    const frequencyMap = new Map();

    // Создаем поток чтения с жестким ограничением буфера в 64 КБ
    const readStream = fs.createReadStream(DATA_FILE, {
        encoding: 'utf-8',
        highWaterMark: 64 * 1024 // 64 КБ буфер по условию
    });

    // Модуль readline позволяет читать поток построчно без загрузки всего файла в память
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        
        // Парсим строку вида: "1, 847, Вариант 6"
        const parts = line.split(',');
        const num = parseInt(parts[1]?.trim(), 10);
        
        if (!isNaN(num)) {
            totalRows++;
            sum += num;
            if (num > maxNum) maxNum = num;
            if (num < minNum) minNum = num;
            
            // Доп. условие: считаем частоту
            frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
            
            // Вывод прогресса каждые 10% (каждые 10 000 строк)
            if (totalRows % 10000 === 0) {
                const percent = (totalRows / TOTAL_LINES) * 100;
                console.log(`⏳ Прогресс: ${percent}% (${totalRows.toLocaleString()} строк обработано)`);
            }
        }
    }

    // Доп. условие: Сортируем и выбираем ТОП-10 частых чисел
    const top10Frequent = [...frequencyMap.entries()]
        .sort((a, b) => b[1] - a[1]) // Сортировка по убыванию частоты
        .slice(0, 10);

    const average = totalRows > 0 ? (sum / totalRows).toFixed(2) : 0;
    const endTime = process.hrtime.bigint();
    const executionTimeSec = (Number(endTime - startTime) / 1e9).toFixed(2);

    // Формируем красивый текстовый отчет для вывода и записи
    const top10Strings = top10Frequent.map(([num, count], i) => `${i + 1}. Число ${num} (встретилось ${count} раз)`).join('\n');
    
    const outputResult = `✅ Обработка завершена!
📊 Результаты:
- Всего строк: ${totalRows.toLocaleString()}
- Сумма чисел: ${sum.toLocaleString()}
- Среднее значение: ${average}
- Максимальное число: ${maxNum}
- Минимальное число: ${minNum}
🔥 10 самых часто встречающихся чисел:
${top10Strings}
📄 Результаты сохранены в: ${path.basename(RESULT_FILE)}
⏱ Время выполнения: ${executionTimeSec} сек`;

    console.log(`\n${outputResult}`);

    // Записываем финальный результат в файл processed_6.txt
    await fsp.writeFile(RESULT_FILE, outputResult, 'utf-8');
}

async function main() {
    try {
        await generateLargeFile();
        await processLargeFile();
    } catch (error) {
        console.error(`❌ Критическая ошибка в Задании 4: ${error.message}`);
    }
}

main();
